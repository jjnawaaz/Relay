import jwt, { JsonWebTokenError } from "jsonwebtoken";
import "dotenv/config";
export interface JwtData {
  id?: string | undefined;
  email?: string | undefined;
  message?: string | undefined;
}
export enum TOKEN {
  ACCESS_TOKEN,
  REFRESH_TOKEN,
}

export const access_token_options = {
  httpOnly: true,
  secure: process.env.NODE_ENV == "production" ? true : false,
  sameSite: "lax",
  maxAge: 1000 * 60 * 15,
};

export const refresh_token_options = {
  httpOnly: true,
  secure: process.env.NODE_ENV == "production" ? true : false,
  sameSite: "lax",
  maxAge: 1000 * 60 * 60 * 24 * 7,
};

// create a jwt token
export const createToken = (user: JwtData, token: TOKEN) => {
  if (token == TOKEN.ACCESS_TOKEN) {
    // access token logic
    const access_token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_ACCESS_SECRET as string,
      { expiresIn: "15m" },
    );
    return access_token;
  } else if (token == TOKEN.REFRESH_TOKEN) {
    // refresh token logic
    const refresh_token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_REFRESH_SECRET as string,
      { expiresIn: "7d" },
    );
    return refresh_token;
  }
};

// verifyJwt
export const verifyToken = (token: string, tokenType: TOKEN) => {
  try {
    // check the token type and get secret
    const secret =
      tokenType === TOKEN.REFRESH_TOKEN
        ? (process.env.JWT_REFRESH_SECRET as string)
        : (process.env.JWT_ACCESS_SECRET as string);
    // verify token
    const decoded = jwt.verify(token, secret);
    return {
      success: true,
      tokenData: decoded,
    };
  } catch (err: unknown) {
    if (err instanceof jwt.TokenExpiredError) {
      return {
        success: false,
        expired: true,
      };
    }
    return {
      success: false,
      expired: false,
    };
  }
};
