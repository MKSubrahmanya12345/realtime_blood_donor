import express from "express";
import {
  registerCollege,
  createEvent,
  getCollegeEvents,
  getActiveEvents,
  getAllColleges
} from "../controllers/college.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import User from "../models/user.model.js"; // For /all colleges

const router = express.Router();

// === PUBLIC ROUTES ===

// Register a new college
router.post("/register", registerCollege);

// Students: See today's active drives
router.get("/active-events", getActiveEvents);

// Signup dropdown: Get all colleges
router.get("/all", async (req, res) => {
  try {
    const colleges = await User.find({ role: "college" })
      .select("fullName _id location");

    res.status(200).json(colleges);
  } catch (error) {
    console.log("Error fetching colleges:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// === PROTECTED ROUTES (College Admin Only) ===

// Create a new event
router.post("/create-event", protectRoute, createEvent);

// Get events created by this college
router.get("/my-events", protectRoute, getCollegeEvents);

export default router;
