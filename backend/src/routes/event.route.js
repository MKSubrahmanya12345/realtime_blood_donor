import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { 
    createEvent, 
    getAllEvents,   // Was getEvents
    getMyEvents,    // New function
    joinEvent,      // Was registerForEvent
    updateEvent,
    leaveEvent     // New function
} from "../controllers/event.controller.js";

const router = express.Router();

// 1. Create Event (Colleges only)
router.post("/create", protectRoute, createEvent);

// 2. Get All Events (Public - for Donors to see)
router.get("/all", protectRoute, getAllEvents);

// 3. Get My Events (Private - for College Dashboard)
router.get("/my-events", protectRoute, getMyEvents);

// 4. Join Event (Student registers)
router.post("/join/:id", protectRoute, joinEvent);

// 5. Update Event (Edit details)
router.put("/:id", protectRoute, updateEvent);

router.post("/leave/:id", protectRoute, leaveEvent);

export default router;