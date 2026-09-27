export type SocketData = {
  type: "join-room" | "chat" | "leave-room";
  roomId: number;
  message?: string;
};
