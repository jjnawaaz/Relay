import express, { Express, Request, Response } from "express";
import cors from "cors";
import cookieparser from "cookie-parser";
import "dotenv/config";

// import routes
import userRoutes from "./routes/userRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { apiRateLimiter } from "./middlewares/rateLimiter.js";

const app: Express = express();

app.set("trust proxy", 1);

// Allowed URLs
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_PRODUCTION_URL,
].filter(Boolean) as string[];

// cors
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

// rate limiter
app.use(apiRateLimiter);

// cookie-parser
app.use(cookieparser());

// req.body
app.use(express.json());

//ALL ROUTES
app.use("/user", userRoutes);
app.use("/room", roomRoutes);

// health
app.get("/health", (_req: Request, res: Response) => {
  res.send("All working good");
});

// error handler middleware
app.use(errorHandler);

export default app;
