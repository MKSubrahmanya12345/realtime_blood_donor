import express from "express";
import { createEvent, getEvents, registerForEvent } from "../controllers/event.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", getEvents); // Public
router.post("/create", protectRoute, createEvent); // Hospital
router.post("/join", protectRoute, registerForEvent); // User (Auto-Verifies)

export default router;