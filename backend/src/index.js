import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path"; // <--- IMPORT PATH

// Database & Socket
import { connectDB } from "./lib/db.js";
import { app, server } from "./lib/socket.js";

// Routes
import authRoutes from "./routes/auth.route.js";
import requestRoutes from "./routes/request.route.js";
import hospitalRoutes from "./routes/hospital.route.js";
import collegeRoutes from "./routes/college.route.js";
import eventRoutes from "./routes/event.route.js";
import notificationRoutes from "./routes/notification.route.js";

dotenv.config();

// Define __dirname manually for ES Modules
const __dirname = path.resolve();

app.set("trust proxy", 1);
const PORT = process.env.PORT || 3000;

// === MIDDLEWARE ===
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: [process.env.CLIENT_URL || "http://localhost:5173", "https://bloodlink-pi.vercel.app"],
    credentials: true
}));

// === API ROUTES ===
app.use("/api/auth", authRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/hospital", hospitalRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/college", collegeRoutes);
app.use("/api/notifications", notificationRoutes);

// === DEPLOYMENT CONFIG (Fixes 404s) ===
if (process.env.NODE_ENV === "production") {
    // 1. Serve static files from the frontend build folder
    app.use(express.static(path.join(__dirname, "../frontend/dist")));

    // 2. Handle React Routing (The Catch-All)
    // If a request doesn't match an API route above, send the React app
    app.get(/.*/, (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
    });
}

// === START SERVER ===
server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
    connectDB();
});