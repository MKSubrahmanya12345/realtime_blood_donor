import express from "express";
import { signup, login, logout, verifyOtp, checkAuth, updateProfile } from "../controllers/auth.controller.js";

import { protectRoute } from "../middleware/auth.middleware.js"; // Import the middleware


const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

router.post("/verify-otp", verifyOtp); // This was missing causing the 404


router.get("/check", protectRoute, checkAuth);
router.put("/update-profile", protectRoute, updateProfile);

export default router;
