import { Redis } from "ioredis";
import "dotenv/config";

const redisUrl = process.env.redisUrl;

if (!redisUrl) {
  throw new Error("REDIS_URL is not defined");
}

const globalRedis = globalThis as unknown as {
  redis: Redis | undefined;
  publisher: Redis | undefined;
  subscriber: Redis | undefined;
};

export const redis =
  globalRedis.redis ??
  new Redis(redisUrl, {
    protocol: 2,
  });

export const publisher =
  globalRedis.publisher ??
  new Redis(redisUrl, {
    protocol: 2,
  });

export const subscriber = globalRedis.subscriber ?? publisher.duplicate();

redis.on("error", (err) => {
  console.error("Redis error:", err.message);
});

publisher.on("error", (err) => {
  console.error("Redis publisher error:", err.message);
});

subscriber.on("error", (err) => {
  console.error("Redis subscriber error:", err.message);
});

if (process.env.NODE_ENV !== "production") {
  globalRedis.redis = redis;
  globalRedis.publisher = publisher;
  globalRedis.subscriber = subscriber;
}

export * from "ioredis";
