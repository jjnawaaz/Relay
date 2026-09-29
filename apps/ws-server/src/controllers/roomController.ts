import WebSocket from "ws";
import { ROOMS } from "../store/rooms.js";
import { subscriber } from "@repo/redis";

export const roomController = async (roomId: number, socket: WebSocket) => {
  // check if room exists already
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

  // create a subscriber here
  const channel = `chat:room:${roomId}`;
  await subscriber.subscribe(channel);
  socket.send("User added to room");
  return;
};
