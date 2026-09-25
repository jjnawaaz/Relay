import express, { Router } from "express";
import { Refresh, Signin, Signup } from "../controllers/userController.js";
import { authHandler } from "../middlewares/authHandler.js";
const router: Router = express.Router();

// router.post("/signup", Signup);
router.post("/signin", Signin);
router.post("/signup", Signup);
router.post("/refresh", authHandler, Refresh);

export default router;
