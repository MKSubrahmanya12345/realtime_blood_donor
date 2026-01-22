import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js"
import { connectDB } from "./lib/db.js";
import cors from "cors";

dotenv.config();


const app = express();

const PORT = process.env.PORT;
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http:localhost:5137",
    credentials: true
}));

app.use("/api/auth", authRoutes);



app.listen(PORT, ()=>{
    console.log(`Listening on port ${PORT}`);
    connectDB();
});