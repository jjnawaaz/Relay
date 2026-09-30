import express from "express";
import cors from "cors";
import { createServer } from "node:http";
import { WebSocketServer } from "ws";
import { authHandler } from "./middlewares/authHandler.js";
import { messageController } from "./controllers/messageController.js";
import { SocketDataSchema } from "@repo/api_contracts";
import "dotenv/config";
import { randomUUID } from "node:crypto";
import { subscriber } from "@repo/redis";
import { ROOMS } from "./store/rooms.js";
import { AuthDataSchema } from "@repo/api_contracts";

// setup express
const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_PRODUCTION_URL,
].filter(Boolean) as string[];

// cors
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

// health check
app.get("/health", (req, res) => {
  res.send("WS server is good ");
});

// create HTTP server
const httpServer = createServer(app);

// setup WebSocket server
const wss = new WebSocketServer({
  server: httpServer,
});

// generate websocket server unique Id
export const WS_SERVER_ID = randomUUID();

// get subscribed messages here from pub subs and business logic to send messages
subscriber.on("message", async (channel, string) => {
  // get all the messages
  const payloadData = JSON.parse(string);

  if (payloadData.serverId === WS_SERVER_ID) return;

  ROOMS.get(payloadData.roomId)?.forEach((socket) => {
    socket.send(payloadData.message);
  });

  return;
});

// web socket server
wss.on("connection", (socket) => {
  socket.once("message", (data) => {
    let rawData: unknown;

    try {
      rawData = JSON.parse(data.toString());
    } catch {
      socket.send("Invalid authentication message");
      socket.close();
      return;
    }

    const authData = AuthDataSchema.safeParse(rawData);

    if (!authData.success) {
      socket.send("Authentication required");
      socket.close();
      return;
    }

    const isValid = authHandler(authData.data.token);

    if (!isValid.success) {
      socket.send(
        isValid.reason === "ACCESS_TOKEN_EXPIRED"
          ? "Access Token Expired"
          : "Authentication Failed",
      );

      socket.close();
      return;
    }

    // check expiry and send message
    const expiresIn = isValid.expiresAt * 1000 - Date.now();

    const warningTime = expiresIn - 60_000;

    const tokenExpiryTimer = setTimeout(
      () => {
        if (socket.readyState === socket.OPEN) {
          socket.send(
            JSON.stringify({
              type: "TOKEN_EXPIRING",
              expiresIn: 60,
            }),
          );
        }
      },
      Math.max(warningTime, 0),
    );

    socket.on("close", () => {
      clearTimeout(tokenExpiryTimer);
    });

    const userId = isValid.userId;

    socket.send(
      JSON.stringify({
        type: "AUTH_SUCCESS",
      }),
    );

    socket.on("message", (data) => {
      let parsedData: unknown;

      try {
        parsedData = JSON.parse(data.toString());
      } catch {
        socket.send("Invalid message format");
        return;
      }

      const result = SocketDataSchema.safeParse(parsedData);

      if (!result.success) {
        socket.send("Invalid message format");
        return;
      }

      messageController(userId, result.data, socket);
    });
  });
});

// IMPORTANT: Vercel needs the server exported
export default httpServer;
