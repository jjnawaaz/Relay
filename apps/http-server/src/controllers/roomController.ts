import { httpStatusCodes } from "@repo/codes";
import {
  CreateRoomService,
  DeleteRoomService,
  GetRoomService,
} from "../services/userServices.js";
import { Request, Response } from "express";
import { deleteRoomSchema, roomSchema } from "@repo/api_contracts";

export const getRooms = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 6;
  const search = String(req.query.search || "").trim();

  const safePage = Math.max(page, 1);
  const safeLimit = Math.min(Math.max(limit, 1), 50);

  const data = await GetRoomService(safePage, safeLimit, search);

  return res.status(httpStatusCodes.OK).json({
    rooms: data.rooms,
    pagination: {
      page: safePage,
      limit: safeLimit,
      totalRooms: data.totalRooms,
      totalPages: data.totalPages,
    },
  });
};

export const createRoom = async (req: Request, res: Response) => {
  // create user
  const user = req.user;
  // check room data
  const parsedData = roomSchema.safeParse(req.body);
  if (!parsedData.success) {
    return res.status(httpStatusCodes.BAD_REQUEST).json({
      message: "Please enter valid fields",
    });
  }

  const data = await CreateRoomService(user, parsedData.data);
  return res.status(httpStatusCodes.CREATED).json({
    room_id: data.id,
    room_name: data.room_name,
  });
};

export const deleteRoom = async (req: Request, res: Response) => {
  // create user
  const user = req.user;
  // check room data
  const id = Number(req.params.id);
  const parsedData = deleteRoomSchema.safeParse({ id });
  if (!parsedData.success) {
    return res.status(httpStatusCodes.BAD_REQUEST).json({
      message: "Please enter valid fields",
    });
  }

  const success = await DeleteRoomService(user, parsedData.data.id);
  if (success) {
    return res.status(httpStatusCodes.OK).json({
      message: "Room deleted successfully",
    });
  }
};
