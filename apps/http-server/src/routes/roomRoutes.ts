import express, { Router } from "express";
import {
  createRoom,
  deleteRoom,
  getRooms,
} from "../controllers/userController.js";
import { authHandler } from "../middlewares/authHandler.js";
const router: Router = express.Router();

router.post("/create-room", authHandler, createRoom);
router.get("/get-room", getRooms);
router.delete("/delete-room/:id", authHandler, deleteRoom);

export default router;
