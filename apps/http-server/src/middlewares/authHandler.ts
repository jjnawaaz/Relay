import { ERROR_CODES, httpStatusCodes } from "@repo/codes";
import { CookieOptions, NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import {
  access_token_options,
  createToken,
  JwtData,
  TOKEN,
  verifyToken,
} from "../utils/jwtUtils.js";
import { AppError } from "./errorHandler.js";

export const authHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // get access token
  const access_token = req.cookies["access_token"];
  if (!access_token) {
    throw new AppError(
      "Please Login Again",
      ERROR_CODES.INVALID_TOKEN,
      httpStatusCodes.UNAUTHORIZED,
    );
  }

  // check access token
  const decoded = verifyToken(access_token, TOKEN.ACCESS_TOKEN);

  // access token valid
  if (decoded.success) {
    req.user = decoded.tokenData as JwtPayload;
    next();
    return;
  }

  // invalid token
  if (!decoded.success && !decoded.expired) {
    throw new AppError(
      "Please Login Again",
      ERROR_CODES.INVALID_TOKEN,
      httpStatusCodes.UNAUTHORIZED,
    );
  }

  // check refresh token
  const refresh_token = req.cookies["refresh_token"];
  if (!refresh_token) {
    throw new AppError(
      "Please Login Again",
      ERROR_CODES.INVALID_TOKEN,
      httpStatusCodes.UNAUTHORIZED,
    );
  }

  const refresh_decoded = verifyToken(refresh_token, TOKEN.REFRESH_TOKEN);

  // invalid or expired refresh token
  if (refresh_decoded.expired || !refresh_decoded.success) {
    throw new AppError(
      "Please Login Again",
      ERROR_CODES.INVALID_TOKEN,
      httpStatusCodes.UNAUTHORIZED,
    );
  }

  // create new token
  const new_refresh_token = createToken(
    refresh_decoded as JwtData,
    TOKEN.ACCESS_TOKEN,
  );

  // set access token to cookie
  res.cookie(
    "access_token",
    new_refresh_token,
    access_token_options as CookieOptions,
  );
  req.user = refresh_decoded.tokenData as JwtPayload;
  next();
};
