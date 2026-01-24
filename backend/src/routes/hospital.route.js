import express from "express";
import { registerHospital, getMyHospital, requestBlood, updateHospitalLocation, updateInventory } from "../controllers/hospital.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// PUBLIC: Registration doesn't need a token because we create the user here
router.post("/register", registerHospital); 

// PROTECTED: These require the user to be logged in
router.get("/me", protectRoute, getMyHospital);
router.post("/request", protectRoute, requestBlood);
router.put("/update-location", protectRoute, updateHospitalLocation);
router.put("/update-inventory", protectRoute, updateInventory);

export default router;