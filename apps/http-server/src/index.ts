import express, { Express, Request, Response } from "express";
import cors from "cors";
import cookieparser from "cookie-parser";
import "dotenv/config";

// import routes
import userRoutes from "./routes/userRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app: Express = express();

// PORT
const PORT = process.env.PORT;

// cors
app.use(cors());

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
