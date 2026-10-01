import express, { Router } from "express";
import {
  createRoom,
  deleteRoom,
  getRoomChats,
  getRooms,
} from "../controllers/roomController.js";
import { authHandler } from "../middlewares/authHandler.js";
import { createRoomRateLimiter } from "../middlewares/rateLimiter.js";
const router: Router = express.Router();

router.post("/create-room", authHandler, createRoomRateLimiter, createRoom);
router.get("/get-room", getRooms);
router.get("/:roomId/chats", getRoomChats);
router.delete("/delete-room/:id", authHandler, deleteRoom);

export default router;
