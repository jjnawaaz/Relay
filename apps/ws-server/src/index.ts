import express from "express";
import cors from "cors";
import { WebSocketServer } from "ws";
import type { IncomingMessage } from "node:http";
import "dotenv/config";
import { authHandler_v1 } from "./middlewares/authHandler.js";

// setup redux store

// setup express
const app = express();
const httpServer = app.listen(process.env.PORT);

// cors
app.use(cors());

// setup ws
const wss = new WebSocketServer({ server: httpServer });

wss.on("connection", async (socket, req: IncomingMessage) => {
  // validate jwt here
  const isValid = await authHandler_v1(req);
  if (!isValid.success && isValid.reason === "AUTHENTICATION_FAILED") {
    socket.send("Authentication Failed");
    socket.close();
  }
  if (!isValid.success && isValid.reason === "ACCESS_TOKEN_EXPIRED") {
    socket.send("Access Token Expired");
    socket.close();
  }

  // tokens are valid
  socket.on("message", (data, req) => {
    socket.send(data.toString());
  });

  // close socket for unauthenticated users
  socket.on("close", (code, reason) => {
    if (code === 1005) {
      console.log("Socket actually closed:", code, "Authentication Failed");
    }
  });
});
