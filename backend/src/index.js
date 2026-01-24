import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js"
import { connectDB } from "./lib/db.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import requestRoutes from "./routes/request.route.js";
import hospitalRoutes from "./routes/hospital.route.js";
import collegeRoutes from "./routes/college.route.js";
import eventRoutes from "./routes/event.route.js";
import express from "express"; 
import notificationRoutes from "./routes/notification.route.js"; // <--- 1. Import

// === CHANGE 1: Import from socket.js ===
import { app, server } from "./lib/socket.js"; 

dotenv.config();

// (app is already created in socket.js, so we just config it)
app.set("trust proxy", 1);

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
}));

app.use("/api/auth", authRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/hospital", hospitalRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/college", collegeRoutes);
app.use("/api/notifications", notificationRoutes); // <--- 2. Add Route

// === CHANGE 2: Use server.listen ===
server.listen(PORT, ()=>{
    console.log(`Listening on port ${PORT}`);
    connectDB();
});