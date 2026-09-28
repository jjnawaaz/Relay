import { PRISMA, prisma } from "@repo/db";
import { redis } from "@repo/redis";
export const processController = async (chatData: any) => {
  const messages = chatData[0][1];
  for (const [messageId, fields] of messages) {
    try {
      await prisma.chat.create({
        data: {
          eventId: messageId,
          userId: fields[1],
          message: fields[3],
          roomId: Number(fields[5]),
        },
      });
      // send acknowledgement that user is added
      await redis.xack("chat-events", "chat-workers", messageId);
      console.log("chat added to db from worker");
    } catch (err) {
      // catch err here
      if (
        err instanceof PRISMA.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        await redis.xack("chat-events", "chat-workers", messageId);
        continue;
      }
      throw err;
    }
  }
};
