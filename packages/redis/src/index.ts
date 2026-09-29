import { Redis } from "ioredis";
import "dotenv/config";
const redisUrl = process.env.redisUrl;

// if there is no redis url fail
if (!redisUrl) {
  throw new Error("REDIS_URL is not defined");
}

const globalRedis = globalThis as unknown as {
  redis: Redis | undefined;
  publisher: Redis | undefined;
  subscriber: Redis | undefined;
};

export const redis = globalRedis.redis ?? new Redis(redisUrl);
export const publisher = globalRedis.publisher ?? new Redis(redisUrl);
export const subscriber = globalRedis.subscriber ?? publisher.duplicate();

if (process.env.NODE_ENV !== "production") globalRedis.redis = redis;

export * from "ioredis";
