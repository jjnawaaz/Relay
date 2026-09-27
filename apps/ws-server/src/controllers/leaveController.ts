import WebSocket from "ws";
import { ROOMS } from "../store/rooms.js";

export const leaveController = (roomId: number, socket: WebSocket) => {
  // check if socket exists in room
  if (!ROOMS.get(roomId)?.has(socket)) {
    socket.send("User doesnt exists in room");
  }
  ROOMS.get(roomId)?.delete(socket);
  socket.send("User left room");
  return;
};
