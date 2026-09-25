import { z } from "zod";

export const SigninSchema = z.object({
  email: z.email(),
  password: z.string(),
});

export type SigninType = z.infer<typeof SigninSchema>;

export const SignupSchema = z.object({
  email: z.email(),
  password: z.string(),
  name: z.string(),
});

export type SignupType = z.infer<typeof SignupSchema>;
