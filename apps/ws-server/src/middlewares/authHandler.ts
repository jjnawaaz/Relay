import { Request } from "express";
import WebSocket from "ws";
import { TOKEN, verifyToken } from "../utils/jwtUtils.js";
import { JwtPayload } from "jsonwebtoken";
import { parseCookie } from "cookie";

type Cookie_Data = {
  access_token: string;
  refresh_token: string;
};

export const authHandler = async (
  req: Request,
  socket: WebSocket,
): Promise<Boolean | undefined> => {
  // get access token
  const token = parseCookie(req.headers.cookie ?? "") as Cookie_Data;
  // check if access_token exists
  if (!token.access_token) {
    socket.send("Invalid Credentials");
    socket.close(1008, "Invalid credentials");
    return false;
  }

  // check access token
  const access_decoded = await verifyToken(
    token.access_token,
    TOKEN.ACCESS_TOKEN,
  );

  // access token valid
  if (access_decoded.success) {
    socket.send("User connected to web socket server");
    return true;
  }

  if (!access_decoded.success && access_decoded.expired) {
    // check refresh_token logic here
    if (!token.refresh_token) {
      socket.send("Invalid Credentials");
      socket.close(1008, "Invalid credentials");
      return false;
    }

    // check if refresh token is valid
    const refresh_decoded = await verifyToken(
      token.refresh_token,
      TOKEN.REFRESH_TOKEN,
    );

    // invalid or expired refresh token
    if (refresh_decoded.expired && !refresh_decoded.success) {
      socket.send("Invalid Credentials");
      socket.close(1008, "Invalid credentials");
      return false;
    }

    // create a new access token just redirect to refresh here
    return true;
  }
};
