import express from "express";
import { createRequest, getAllRequests } from "../controllers/request.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/create", protectRoute, createRequest); // Only logged in users
router.get("/all", getAllRequests); // Public (or protect if you want)

export default router;