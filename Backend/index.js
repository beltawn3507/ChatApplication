import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import colors from "colors";
import connectDB from "./config/Db.js";
import userRoutes from "./routes/userRoutes.js";
import messageRoutes from "./routes/message.route.js";
import cors from "cors";
import { app, server } from "./utils/socket.js";


// const app = express();
const PORT = 3000;


// Load environment variables
dotenv.config();

// Connect to DB
connectDB();

// Middleware
app.use(cookieParser());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: true }));
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Routes
app.use("/api/user", userRoutes);
app.use("/api/message", messageRoutes);



// Start server
server.listen(PORT, () =>
  console.log(`Connected to PORT ${PORT}`.yellow.underline)
);
