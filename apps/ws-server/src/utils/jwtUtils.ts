import jwt, { JwtPayload } from "jsonwebtoken";

type VerifyTokenResult =
  | {
      success: true;
      tokenData: string;
      expiresAt: number;
    }
  | {
      success: false;
      expired: boolean;
    };

export const verifyToken = (token: string): VerifyTokenResult => {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET as string,
    ) as JwtPayload;

    return {
      success: true,
      tokenData: decoded.id,
      expiresAt: decoded.exp as number,
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
