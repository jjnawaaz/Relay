import WebSocket from "ws";
import { ROOMS } from "../store/rooms.js";
import { subscriber } from "@repo/redis";

export const leaveController = async (roomId: number, socket: WebSocket) => {
  // check if socket exists in room
  if (!ROOMS.get(roomId)?.has(socket)) {
    socket.send("User doesnt exists in room");
    return;
  }
  ROOMS.get(roomId)?.delete(socket);
  // unsubscribe if the room is empty
  if (ROOMS.get(roomId)?.size === 0) {
    const channel = `chat:room:${roomId}`;
    await subscriber.unsubscribe(channel);
    ROOMS.delete(roomId);
  }
  socket.send("User left room");
  return;
};
