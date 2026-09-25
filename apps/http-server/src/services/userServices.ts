import { SigninType, SignupType } from "@repo/api_contracts";
import { createHash, verifyHash } from "../utils/bcryptUtils.js";
import { db } from "@repo/db";
import { ERROR_CODES, httpStatusCodes } from "@repo/codes";
import { AppError } from "../middlewares/errorHandler.js";
import { isDuplicateError } from "../utils/errorUtils.js";

export const SignUpService = async (data: SignupType) => {
  // check if the user exists
  try {
    const hashedPassword = await createHash(data.password);
    const user = await db.orm.public.User.create({
      email: data.email,
      name: data.name,
      password: hashedPassword,
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
  const user = await db.orm.public.User.where({
    email: data.email,
  }).first();

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
