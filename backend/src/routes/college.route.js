import express from "express";
import { registerCollege, createEvent, getCollegeEvents, getActiveEvents, getAllColleges } from "../controllers/college.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public
router.post("/register", registerCollege);
router.get("/active-events", getActiveEvents); // For students to see today's drives

// Protected (College Admin Only)
router.post("/create-event", protectRoute, createEvent);
router.get("/my-events", protectRoute, getCollegeEvents);

export default router;