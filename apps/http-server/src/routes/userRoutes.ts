import express, { Router } from "express";
import {
  logout,
  refreshToken,
  signIn,
  signUp,
} from "../controllers/userController.js";
import { authHandler } from "../middlewares/authHandler.js";
import { signinRateLimiter } from "../middlewares/rateLimiter.js";
const router: Router = express.Router();

router.post("/signin", signinRateLimiter, signIn);
router.post("/signup", signUp);
router.post("/refresh", authHandler, refreshToken);
router.post("/logout", logout);

export default router;
