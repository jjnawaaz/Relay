import { ERROR_CODES, httpStatusCodes } from "@repo/codes";
import { prisma } from "@repo/db";
import { AppError } from "../middlewares/errorHandler.js";
import { isDuplicateError } from "../utils/errorUtils.js";

interface GetRoomChatsParams {
  roomId: number;
  cursor?: number;
  limit?: number;
}

export const GetRoomService = async (
  page: number,
  limit: number,
  search: string,
) => {
  const skip = (page - 1) * limit;

  const where = search
    ? {
        room_name: {
          contains: search,
          mode: "insensitive" as const,
        },
      }
    : {};

  const [rooms, totalRooms] = await Promise.all([
    prisma.room.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.room.count({
      where,
    }),
  ]);

  return {
    rooms,
    totalRooms,
    totalPages: Math.ceil(totalRooms / limit),
  };
};

export const CreateRoomService = async (user: any, room_data: any) => {
  try {
    const room = await prisma.room.create({
      data: {
        room_name: room_data.room_name,
        adminId: user.id,
      },
    });
    return {
      id: room.id,
      room_name: room.room_name,
    };
  } catch (err: unknown) {
    console.log(err);
    if (isDuplicateError(err)) {
      throw new AppError(
        "Room already exists",
        ERROR_CODES.ROOM_ALREADY_EXISTS,
        httpStatusCodes.CONFLICT,
      );
    }
    throw err;
  }
};

export const DeleteRoomService = async (user: any, room_id: any) => {
  // check if the room belongs to user
  const isValid = await prisma.room.findFirst({
    where: {
      adminId: user.id,
      id: room_id,
    },
  });
  if (isValid) {
    try {
      await prisma.room.delete({
        where: {
          id: Number(room_id),
        },
      });
      return {
        success: true,
      };
    } catch (err: unknown) {
      throw err;
    }
  }
  throw new AppError(
    "Unauthorized user",
    ERROR_CODES.FORBIDDEN,
    httpStatusCodes.UNAUTHORIZED,
  );
};

export const getRoomChatsService = async ({
  roomId,
  cursor,
  limit = 30,
}: GetRoomChatsParams) => {
  const chats = await prisma.chat.findMany({
    where: {
      roomId,
      ...(cursor
        ? {
            id: {
              lt: cursor,
            },
          }
        : {}),
    },

    orderBy: {
      id: "desc",
    },

    take: limit + 1,

    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  const hasMore = chats.length > limit;

  const messages = hasMore ? chats.slice(0, limit) : chats;

  const nextCursor = hasMore ? messages[messages.length - 1]?.id : null;

  return {
    chats: messages.reverse(),
    nextCursor,
    hasMore,
  };
};
