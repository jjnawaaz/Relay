import { CookieOptions, Request, Response } from "express";
import { SigninSchema, SignupSchema } from "@repo/api_contracts";
import { httpStatusCodes } from "@repo/codes";
import {
  access_token_options,
  createToken,
  JwtData,
  refresh_token_options,
  TOKEN,
} from "../utils/jwtUtils.js";
import { SignInService, SignUpService } from "../services/userServices.js";

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
    token: access_token,
  });
};

export const logout = (_req: Request, res: Response) => {
  res.clearCookie("access_token", access_token_options);
  res.clearCookie("refresh_token", refresh_token_options);

  return res.status(httpStatusCodes.OK).json({
    message: "Logged out successfully",
  });
};

export const refreshToken = (req: Request, res: Response) => {
  const access_token = createToken(req.user as JwtData, TOKEN.ACCESS_TOKEN);
  return res.json({
    message: "User refreshed successfully",
    success: true,
    token: access_token,
  });
};
