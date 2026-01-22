import express from "express";
import { signup, login, logout, verifyOtp } from "../controllers/auth.controller.js";


const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

router.post("/verify-otp", verifyOtp); // This was missing causing the 404


export default router;
