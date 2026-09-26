import { CookieOptions, Request, Response } from "express";
import {
  deleteRoomSchema,
  roomSchema,
  SigninSchema,
  SignupSchema,
} from "@repo/api_contracts";
import { httpStatusCodes } from "@repo/codes";
import {
  access_token_options,
  createToken,
  refresh_token_options,
  TOKEN,
} from "../utils/jwtUtils.js";
import {
  CreateRoomService,
  DeleteRoomService,
  GetRoomService,
  SignInService,
  SignUpService,
} from "../services/userServices.js";

export const signUp = async (req: Request, res: Response) => {
  // validate the data
  const parsedData = SignupSchema.safeParse(req.body);
  if (!parsedData.success) {
    return res.status(httpStatusCodes.BAD_REQUEST).json({
      message: "Please enter valid fields",
    });
  }
  const user = await SignUpService(parsedData.data);
  return res.status(httpStatusCodes.CREATED).json({
    message: "User created successfully",
    user: user,
  });
};

export const signIn = async (req: Request, res: Response) => {
  // validate fields
  const parsedData = SigninSchema.safeParse(req.body);
  if (!parsedData.success) {
    return res.status(httpStatusCodes.BAD_REQUEST).json({
      message: "Please enter valid fields",
    });
  }

  // call signin user service
  const user = await SignInService(parsedData.data);

  // create jwt token here
  const access_token = createToken(user, TOKEN.ACCESS_TOKEN);
  const refresh_token = createToken(user, TOKEN.REFRESH_TOKEN);

  // set tokens in cookies
  res.cookie(
    "access_token",
    access_token,
    access_token_options as CookieOptions,
  );
  res.cookie(
    "refresh_token",
    refresh_token,
    refresh_token_options as CookieOptions,
  );
  return res.status(httpStatusCodes.OK).json({
    message: "User successfully Signed In",
  });
};
export const Refresh = (req: Request, res: Response) => {
  const data = req.user;
  return res.json({
    data: data,
  });
};

export const getRooms = async (req: Request, res: Response) => {
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
