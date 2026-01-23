import Hospital from "../models/hospital.model.js";
import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import { generateToken } from "../lib/utils.js";
import { sendEmergencyEmail } from "../lib/email.js";

// === 1. ONE-SHOT REGISTER (Create User + Hospital) ===
export const registerHospital = async (req, res) => {
  let savedUser = null; // Track user for emergency deletion (rollback)

  try {
    const {
      fullName, email, password, phone, // Admin Details
      hospitalName, licenseNumber, address, latitude, longitude, // Hospital Details
      capacity, hasEmergencyServices, operatingHours
    } = req.body;

    // --- VALIDATION STEP (Do this FIRST) ---
    if (!latitude || !longitude) {
      return res.status(400).json({ message: "Hospital location is required" });
    }

    const lng = parseFloat(longitude);
    const lat = parseFloat(latitude);

    if (isNaN(lng) || isNaN(lat)) {
        return res.status(400).json({ 
            error: "Invalid location. Coordinates must be numbers." 
        });
    }

    // Check for duplicates
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already registered" });

    const existingHospital = await Hospital.findOne({ licenseNumber });
    if (existingHospital) return res.status(400).json({ message: "License number already registered" });

    // --- STEP 1: Create Admin User ---
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      phone,
      role: "hospital",
      isEmailVerified: true,
      isPhoneVerified: true
    });
    
    savedUser = await newUser.save(); // <--- User is in DB now

    // --- STEP 2: Create Hospital Profile ---
    const newHospital = new Hospital({
      hospitalName,
      email,
      licenseNumber,
      contactNumber: phone,
      address,
      location: {
        type: "Point",
        coordinates: [lng, lat] // [Longitude, Latitude]
      },
      capacity,
      hasEmergencyServices,
      operatingHours,
      adminUserId: savedUser._id
    });

    await newHospital.save();

    // --- STEP 3: Success ---
    generateToken(savedUser._id, res);

    res.status(201).json({
      _id: savedUser._id,
      email: savedUser.email,
      role: "hospital",
      hospitalName: newHospital.hospitalName,
      message: "Hospital Registered Successfully!"
    });

  } catch (error) {
    console.log("Error in registerHospital:", error.message);

    // === ROLLBACK ===
    // If the hospital failed to save, DELETE the user we just created.
    if (savedUser) {
        await User.findByIdAndDelete(savedUser._id);
        console.log("⚠️ Rolled back orphaned user:", savedUser.email);
    }

    res.status(500).json({ message: "Server Error" });
  }
};

// === 2. GET HOSPITAL DETAILS ===
export const getMyHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ adminUserId: req.user._id });
    if (!hospital) return res.status(404).json({ message: "Hospital profile not found" });
    res.status(200).json(hospital);
  } catch (error) {
    console.log("Error in getMyHospital:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// === 3. REQUEST BLOOD ===
export const requestBlood = async (req, res) => {
    try {
        const { bloodGroup, units } = req.body;
        
        const hospital = await Hospital.findOne({ adminUserId: req.user._id });

        if (!hospital) return res.status(404).json({ message: "Hospital profile not found." });
        if (!hospital.location || !hospital.location.coordinates) {
            return res.status(400).json({ message: "Hospital location missing." });
        }

        console.log(`Searching for ${bloodGroup} donors within 10km of ${hospital.hospitalName}...`);

        // === 10KM SEARCH LOGIC ===
        const nearbyDonors = await User.find({
            role: 'donor',
            bloodGroup: bloodGroup,
            isAvailable: true, 
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: hospital.location.coordinates
                    },
                    $maxDistance: 10000 // 10km radius
                }
            }
        });

        if (nearbyDonors.length === 0) {
            return res.status(200).json({ 
                message: "No compatible donors found nearby.",
                donorsFound: 0
            });
        }

        // === SEND EMAILS ===
        // Using Promise.allSettled to ensure one failed email doesn't crash the loop
        const emailResults = await Promise.allSettled(nearbyDonors.map(donor => {
            return sendEmergencyEmail(
                donor.email,
                donor.fullName,
                hospital.hospitalName,
                bloodGroup,
                units,
                hospital.address,
                hospital.contactNumber
            );
        }));

        const successCount = emailResults.filter(r => r.status === 'fulfilled').length;

        res.status(200).json({
            message: `Emergency broadcast sent successfully!`,
            donorsFound: nearbyDonors.length,
            emailsSent: successCount
        });

    } catch (error) {
        console.log("Error in requestBlood:", error.message);
        res.status(500).json({ message: "Server Error" });
    }
};