import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { WebSocketServer } from "ws";
import "dotenv/config";

// setup redux store

// setup express
const app = express();
const httpServer = app.listen(process.env.PORT);

// cookie parser
app.use(cookieParser());

// cors
app.use(cors());

// setup ws
const wss = new WebSocketServer({ server: httpServer });

wss.on("connection", (socket) => {
  socket.on("message", (data) => {
    socket.send(data.toString());
    console.log(data.toString());
  });
});
