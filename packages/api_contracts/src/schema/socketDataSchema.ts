import { z } from "zod";

export const SocketDataSchema = z.object({
  type: z.string(),
  roomId: z.number(),
  message: z.string().optional(),
});

export type SocketDataType = z.infer<typeof SocketDataSchema>;
