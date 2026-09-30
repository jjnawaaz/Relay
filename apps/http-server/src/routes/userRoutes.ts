import express, { Router } from "express";
import { refreshToken, signIn, signUp } from "../controllers/userController.js";
import { authHandler } from "../middlewares/authHandler.js";
import { signinRateLimiter } from "../middlewares/rateLimiter.js";
const router: Router = express.Router();

router.post("/signin", signinRateLimiter, signIn);
router.post("/signup", signUp);
router.post("/refresh", authHandler, refreshToken);

export default router;
