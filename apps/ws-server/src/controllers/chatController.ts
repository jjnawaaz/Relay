import WebSocket from "ws";
import { ROOMS } from "../store/rooms.js";

export const chatController = (
  roomId: number,
  message: string,
  socket: WebSocket,
) => {
  // check if the socket exists in room
  if (!ROOMS.get(roomId)?.has(socket)) {
    socket.send("User doesn't exist in the room");
    return;
  }
  ROOMS.get(roomId)?.forEach((socket) => {
    socket.send(message);
  });
  return;
};
