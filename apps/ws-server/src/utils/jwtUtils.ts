import { redis } from "@repo/redis";
import jwt, { JwtPayload } from "jsonwebtoken";

export enum TOKEN {
  ACCESS_TOKEN,
  REFRESH_TOKEN,
}

export const verifyToken = async (token: string, tokenType: TOKEN) => {
  try {
    // check the token type and get secret
    const secret =
      tokenType === TOKEN.REFRESH_TOKEN
        ? (process.env.JWT_REFRESH_SECRET as string)
        : (process.env.JWT_ACCESS_SECRET as string);
    // verify token
    const decoded = jwt.verify(token, secret) as JwtPayload;
    // check if the user exists in redis
    const isExistingUser = await redis.sismember("logged_user_id", decoded.id);
    if (isExistingUser == 1) {
      return {
        success: true,
        tokenData: decoded.id,
      };
    } else {
      return {
        success: false,
        expired: true,
      };
    }
  } catch (err: unknown) {
    if (err instanceof jwt.TokenExpiredError) {
      return {
        success: false,
        expired: true,
      };
    }
    throw err;
  }
};
