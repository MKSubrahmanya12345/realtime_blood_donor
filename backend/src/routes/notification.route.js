import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getMyNotifications, markAsRead, deleteNotification } from "../controllers/notification.controller.js";

const router = express.Router();

router.get("/", protectRoute, getMyNotifications);
router.put("/:id/read", protectRoute, markAsRead);
router.delete("/:id", protectRoute, deleteNotification);

export default router;