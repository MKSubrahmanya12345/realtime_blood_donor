import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js"
import { connectDB } from "./lib/db.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import requestRoutes from "./routes/request.route.js";
import hospitalRoutes from "./routes/hospital.route.js";


dotenv.config();


const app = express();

const PORT = process.env.PORT;
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));


app.use("/api/auth", authRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/hospital", hospitalRoutes);




app.listen(PORT, ()=>{
    console.log(`Listening on port ${PORT}`);
    connectDB();
});