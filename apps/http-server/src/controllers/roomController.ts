import { httpStatusCodes } from "@repo/codes";
import {
  CreateRoomService,
  DeleteRoomService,
  GetRoomService,
} from "../services/userServices.js";
import { Request, Response } from "express";
import { deleteRoomSchema, roomSchema } from "@repo/api_contracts";

export const getRooms = async (_req: Request, res: Response) => {
  const data = await GetRoomService();
  return res.status(httpStatusCodes.OK).json({
    rooms: data,
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
  console.log(typeof id);
  const parsedData = deleteRoomSchema.safeParse({ id });
  if (!parsedData.success) {
    console.log(parsedData);
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
