import { z } from "zod";

export const roomSchema = z.object({
  room_name: z.string(),
});

export const deleteRoomSchema = z.object({
  id: z.number(),
});

export type roomType = z.infer<typeof roomSchema>;
export type deleteRoomType = z.infer<typeof deleteRoomSchema>;
