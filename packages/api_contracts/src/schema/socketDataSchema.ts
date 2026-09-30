import { z } from "zod";

export const SocketDataSchema = z.object({
  type: z.string(),
  roomId: z.number(),
  message: z.string().optional(),
});

export type SocketDataType = z.infer<typeof SocketDataSchema>;

export const AuthDataSchema = z.object({
  type: z.literal("AUTH"),
  token: z.string().min(1),
});

export type AuthDataType = z.infer<typeof AuthDataSchema>;

export const TokenExpiringSchema = z.object({
  type: z.literal("TOKEN_EXPIRING"),
  expiresIn: z.number(),
});

export type TokenExpiringType = z.infer<typeof TokenExpiringSchema>;
