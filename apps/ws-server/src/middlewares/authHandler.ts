import { verifyToken } from "../utils/jwtUtils.js";

type AuthResult =
  | {
      success: true;
      userId: string;
      expiresAt: number;
    }
  | {
      success: false;
      reason: "ACCESS_TOKEN_EXPIRED" | "AUTHENTICATION_FAILED";
    };

export const authHandler = (accessToken: string): AuthResult => {
  const access_decoded = verifyToken(accessToken);

  if (access_decoded.success) {
    return {
      success: true,
      userId: access_decoded.tokenData,
      expiresAt: access_decoded.expiresAt,
    };
  }

  if (access_decoded.expired) {
    return {
      success: false,
      reason: "ACCESS_TOKEN_EXPIRED",
    };
  }

  return {
    success: false,
    reason: "AUTHENTICATION_FAILED",
  };
};
