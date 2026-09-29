import WebSocket from "ws";
import { ROOMS } from "../store/rooms.js";
import { publisher, redis, subscriber } from "@repo/redis";
import { WS_SERVER_ID } from "../index.js";

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

  // check if there is any publisher for this room if not create it here
  // call save db worker here
  await redis.xadd(
    "chat-events",
    "*",
    "id",
    userId,
    "message",
    message,
    "roomId",
    roomId.toString(),
  );
  const payload = {
    userId: userId,
    roomId: roomId,
    message: message,
    serverId: WS_SERVER_ID,
  };

  // channel
  const channel = `chat:room:${roomId}`;

  // publish message to others as well
  await publisher.publish(channel, JSON.stringify(payload));

  // subscriber message

  // send messages to users in this ws - server
  ROOMS.get(roomId)?.forEach((socket) => {
    socket.send(message);
  });
  return;
};
