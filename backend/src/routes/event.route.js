import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { 
    createEvent, getAllEvents, getMyEvents, getEventParticipants,
    joinEvent, markAsDonated, // Added
    updateEvent, leaveEvent, deleteEvent, getCertificateData
} from "../controllers/event.controller.js";

const router = express.Router();

// 1. Create Event (Colleges only)
router.post("/create", protectRoute, createEvent);

// 2. Get All Events (Public - for Donors to see)
router.get("/all", protectRoute, getAllEvents);

router.post("/:id/donated", protectRoute, markAsDonated);

// 3. Get My Events (Private - for College Dashboard)
router.get("/my-events", protectRoute, getMyEvents);

// 4. Join Event (Student registers)
router.post("/join/:id", protectRoute, joinEvent);

// 5. Update Event (Edit details)
router.put("/:id", protectRoute, updateEvent);

router.post("/leave/:id", protectRoute, leaveEvent);

router.delete("/:id", protectRoute, deleteEvent);

// 6. Get Certificate Data
router.get("/certificate/:id", protectRoute, getCertificateData);

router.get("/:id/participants", protectRoute, getEventParticipants);

export default router;