import WebSocket from "ws";
import { ROOMS } from "../store/rooms.js";
export const roomController = (roomId: number, socket: WebSocket) => {
  if (ROOMS.has(roomId)) {
    // check if the room has socket already
    if (!ROOMS.get(roomId)?.has(socket)) {
      ROOMS.get(roomId)?.add(socket);
      socket.send("User added to room");
      return;
    }
    socket.send("User already exists in room");
    return;
  }
  // if no room
  ROOMS.set(roomId, new Set());
  ROOMS.get(roomId)?.add(socket);
  socket.send("User added to room");
  return;
};
