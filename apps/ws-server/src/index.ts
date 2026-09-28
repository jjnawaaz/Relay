import express from "express";
import cors from "cors";
import { WebSocketServer } from "ws";
import type { IncomingMessage } from "node:http";
import { authHandler_v1 } from "./middlewares/authHandler.js";
import { SocketData } from "./types/socketType.js";
import { messageController } from "./controllers/messageController.js";
import { SocketDataSchema } from "@repo/api_contracts";
import "dotenv/config";

// setup express
const app = express();
const httpServer = app.listen(process.env.PORT);

// cors
app.use(cors());

// setup ws
const wss = new WebSocketServer({ server: httpServer });

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
      // continue processing
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

  // close socket for unauthenticated users
  socket.on("close", (code, reason) => {
    if (code === 1005) {
      console.log("Socket actually closed:", code, "Authentication Failed");
    }
  });
});
