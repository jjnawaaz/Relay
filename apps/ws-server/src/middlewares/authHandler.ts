import { TOKEN, verifyToken } from "../utils/jwtUtils.js";
import { Cookies, parseCookie } from "cookie";
import { checkUserInRedis } from "../utils/redisUtils.js";
import type { IncomingMessage } from "node:http";

type AuthResult =
  | {
      success: true;
      userId: string;
    }
  | {
      success: false;
      reason: "ACCESS_TOKEN_EXPIRED" | "AUTHENTICATION_FAILED";
    };

export const authHandler_v1 = async (
  req: IncomingMessage,
): Promise<AuthResult> => {
  const token = parseCookie(req.headers.cookie ?? "") as Cookies;
  // check if tokens exists
  if (!token.access_token || !token.refresh_token) {
    return {
      success: false,
      reason: "AUTHENTICATION_FAILED",
    };
  }
  // verify token
  const access_decoded = verifyToken(token.access_token, TOKEN.ACCESS_TOKEN);
  // success
  if (access_decoded.success) {
    // verify redis
    const isExistingUser = await checkUserInRedis(access_decoded.tokenData);
    if (isExistingUser === 0) {
      return {
        success: false,
        reason: "AUTHENTICATION_FAILED",
      };
    }
    return {
      success: true,
      userId: access_decoded.tokenData,
    };
  }

  // access token failure (expired token)
  // verify refresh token
  const refresh_decoded = verifyToken(token.refresh_token, TOKEN.REFRESH_TOKEN);
  // refresh token invalid
  if (!refresh_decoded.success) {
    return {
      success: false,
      reason: "AUTHENTICATION_FAILED",
    };
  } else {
    // access token expired
    return {
      success: false,
      reason: "ACCESS_TOKEN_EXPIRED",
    };
  }
};
