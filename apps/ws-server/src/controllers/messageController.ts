import WebSocket from "ws";
import { SocketData } from "../types/socketType.js";
import { roomController } from "./roomController.js";
import { chatController } from "./chatController.js";
import { leaveController } from "./leaveController.js";

export const messageController = (data: SocketData, socket: WebSocket) => {
  // message controller
  switch (data.type) {
    case "join-room":
      return roomController(data.roomId, socket);
    case "chat":
      if (!data.message) return;
      return chatController(data.roomId, data.message, socket);
    case "leave-room":
      return leaveController(data.roomId, socket);
    default:
      return socket.send("invalid message");
  }
};
