import { NextFunction, Request, Response } from "express";
import { ErrorCode, httpCode, httpStatusCodes } from "@repo/codes";

export class AppError extends Error {
  public statusCode: httpCode;
  public errorCode: ErrorCode;
  constructor(message: string, errorCode: ErrorCode, statusCode: httpCode) {
    super(message);
    ((this.name = "AppError"),
      (this.statusCode = statusCode),
      (this.errorCode = errorCode));
  }
}

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      code: err.errorCode,
      message: err.message,
    });
  }
  if (err instanceof Error) {
    console.error(err);
    return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Internal Server Error",
    });
  }
};
