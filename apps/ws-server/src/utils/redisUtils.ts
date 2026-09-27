import { redis } from "@repo/redis";

export const checkUserInRedis = async (data: string) => {
  const isExistingUser = await redis.sismember("logged_user_id", data);
  return isExistingUser;
};
