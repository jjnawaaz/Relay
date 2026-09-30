import express from "express";
import cors from "cors";
import { createServer } from "node:http";
import { WebSocketServer } from "ws";
import type { IncomingMessage } from "node:http";
import { authHandler_v1 } from "./middlewares/authHandler.js";
import { SocketData } from "./types/socketType.js";
import { messageController } from "./controllers/messageController.js";
import { SocketDataSchema } from "@repo/api_contracts";
import "dotenv/config";
import { randomUUID } from "node:crypto";
import { subscriber } from "@repo/redis";
import { ROOMS } from "./store/rooms.js";

// setup express
const app = express();

// cors
app.use(cors());

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
wss.on("connection", async (socket, req: IncomingMessage) => {
  // validate jwt here
  const isValid = await authHandler_v1(req);

  if (!isValid.success) {
    socket.send(
      isValid.reason === "ACCESS_TOKEN_EXPIRED"
        ? "Access Token Expired"
        : "Authentication Failed",
    );

    socket.close();
    return;
  }

  // tokens are valid
  socket.on("message", (data) => {
    // check type of room
    let parsedData;

    try {
      parsedData = JSON.parse(data.toString()) as SocketData;
    } catch (err) {
      socket.send("Invalid message format");
      return;
    }

    parsedData = SocketDataSchema.safeParse(parsedData);

    if (!parsedData.success) {
      socket.send("Invalid message format");
      return;
    }

    messageController(isValid.userId, parsedData.data, socket);
  });

  // close socket
  socket.on("close", (code, reason) => {
    if (code === 1005) {
      console.log("Socket actually closed:", code, "Authentication Failed");
    }
  });
});

// IMPORTANT: Vercel needs the server exported
export default httpServer;
