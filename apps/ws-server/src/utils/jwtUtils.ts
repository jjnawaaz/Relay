import jwt, { JwtPayload } from "jsonwebtoken";

export enum TOKEN {
  ACCESS_TOKEN,
  REFRESH_TOKEN,
}

type VerifyTokenResult =
  | {
      success: true;
      tokenData: string;
    }
  | {
      success: false;
      expired: true;
    };

export const verifyToken = (
  token: string,
  tokenType: TOKEN,
): VerifyTokenResult => {
  try {
    // check the token type and get secret
    const secret =
      tokenType === TOKEN.REFRESH_TOKEN
        ? (process.env.JWT_REFRESH_SECRET as string)
        : (process.env.JWT_ACCESS_SECRET as string);
    // verify token
    const decoded = jwt.verify(token, secret) as JwtPayload;

    return {
      success: true,
      tokenData: decoded.id,
    };
  } catch (err: unknown) {
    if (err instanceof jwt.TokenExpiredError) {
      return {
        success: false,
        expired: true,
      };
    }
    throw err;
  }
};
