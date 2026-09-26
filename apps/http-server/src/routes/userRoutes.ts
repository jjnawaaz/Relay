import express, { Router } from "express";
import { Refresh, signIn, signUp } from "../controllers/userController.js";
import { authHandler } from "../middlewares/authHandler.js";
const router: Router = express.Router();

router.post("/signin", signIn);
router.post("/signup", signUp);
router.post("/refresh", authHandler, Refresh);

export default router;
