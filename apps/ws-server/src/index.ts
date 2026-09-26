import express, { Request } from "express";
import cors from "cors";
import { WebSocketServer } from "ws";
import "dotenv/config";
import { authHandler } from "./middlewares/authHandler.js";

// setup redux store

// setup express
const app = express();
const httpServer = app.listen(process.env.PORT);

// cors
app.use(cors());

// setup ws
const wss = new WebSocketServer({ server: httpServer });

wss.on("connection", (socket, req: Request) => {
  // validate jwt here
  authHandler(req, socket);
  socket.on("message", (data, req) => {
    socket.send(data.toString());
  });

  // close socket for unauthenticated users
  socket.on("close", (code, reason) => {
    console.log("Socket actually closed:", code, reason.toString());
  });
});
