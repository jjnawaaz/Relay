import { SigninType, SignupType } from "@repo/api_contracts";
import { createHash, verifyHash } from "../utils/bcryptUtils.js";
import { prisma } from "@repo/db";
import { ERROR_CODES, httpStatusCodes } from "@repo/codes";
import { AppError } from "../middlewares/errorHandler.js";
import { isDuplicateError } from "../utils/errorUtils.js";

export const SignUpService = async (data: SignupType) => {
  // check if the user exists
  try {
    const hashedPassword = await createHash(data.password);
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
      },
    });
    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  } catch (err: unknown) {
    if (isDuplicateError(err)) {
      throw new AppError(
        "User already exists",
        ERROR_CODES.USER_ALREADY_EXISTS,
        httpStatusCodes.CONFLICT,
      );
    }
    throw err;
  }
};

// signin service
export const SignInService = async (data: SigninType) => {
  // find user in db
  const user = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });

  if (!user) {
    throw new AppError(
      "Invalid Credentials",
      ERROR_CODES.INVALID_CREDENTIALS,
      httpStatusCodes.UNAUTHORIZED,
    );
  }

  // verify hash
  const isVerified = await verifyHash(data.password, user.password);
  if (!isVerified) {
    throw new AppError(
      "Invalid Credentials",
      ERROR_CODES.INVALID_CREDENTIALS,
      httpStatusCodes.UNAUTHORIZED,
    );
  }

  return {
    id: user.id,
    email: user.email,
  };
};

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
