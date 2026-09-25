import { Redis } from "ioredis";
import "dotenv/config";
const redisUrl = process.env.redisUrl;

// if there is no redis url fail
if (!redisUrl) {
  throw new Error("REDIS_URL is not defined");
}

const globalRedis = globalThis as unknown as { redis: Redis | undefined };

export const redis = globalRedis.redis ?? new Redis(redisUrl);

if (process.env.NODE_ENV !== "production") globalRedis.redis = redis;

export * from "ioredis";
