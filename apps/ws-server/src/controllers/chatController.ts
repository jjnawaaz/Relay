import WebSocket from "ws";
import { ROOMS } from "../store/rooms.js";
import { redis } from "@repo/redis";
export const chatController = async (
  userId: string,
  roomId: number,
  message: string,
  socket: WebSocket,
) => {
  // check if the socket exists in room
  if (!ROOMS.get(roomId)?.has(socket)) {
    socket.send("User doesn't exist in the room");
    return;
  }
  // call save db worker here
  const sendData = await redis.xadd(
    "chat-events",
    "*",
    "id",
    userId,
    "message",
    message,
    "roomId",
    roomId.toString(),
  );
  // send it to other ws servers. pub - sub

  // send messages to users in this ws - server
  ROOMS.get(roomId)?.forEach((socket) => {
    socket.send(message);
  });
  return;
};
