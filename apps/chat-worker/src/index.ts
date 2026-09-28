import { redis } from "@repo/redis";
import { processController } from "./controllers/processController.js";

// get all groups
const groups = (await redis.xinfo("GROUPS", "chat-events")) as any;

// check if group exists
const groupExists = groups.some((group: any) => group[1] === "chat-workers");

// create group
if (!groupExists) {
  await redis.xgroup("CREATE", "chat-events", "chat-workers", "$", "MKSTREAM");
}

// check if pending data exists
while (true) {
  const pendingData = await redis.xreadgroup(
    "GROUP",
    "chat-workers",
    "worker-1",
    "COUNT",
    10,
    "STREAMS",
    "chat-events",
    "0",
  );

  // check if pending messages exists
  const messages = pendingData?.[0]?.[1];
  if (!messages || messages.length === 0) {
    console.log("exited pending loop");
    break;
  }
  // process pending data
  await processController(pendingData);
}

// start the worker
while (true) {
  // continue the new work
  const chatData = await redis.xreadgroup(
    "GROUP",
    "chat-workers", // name of the group
    "worker-1", // worker_name
    "COUNT", // Count - no of records
    10,
    "BLOCK", // BLOCK for 5 seconds
    5000,
    "STREAMS", // Streams
    "chat-events", // stream name
    ">", // only new events
  );
  if (!chatData) {
    continue;
  }

  // process data here
  await processController(chatData);
}
