import Hospital from "../models/hospital.model.js";
import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import { generateToken } from "../lib/utils.js";
import { sendEmergencyEmail } from "../lib/email.js";

// === 1. ONE-SHOT REGISTER (Create User + Hospital) ===
export const registerHospital = async (req, res) => {
  let savedUser = null; 

  try {
    const {
      fullName, email, password, phone, 
      hospitalName, licenseNumber, address, latitude, longitude, 
      capacity, hasEmergencyServices, operatingHours
    } = req.body;

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

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already registered" });

    const existingHospital = await Hospital.findOne({ licenseNumber });
    if (existingHospital) return res.status(400).json({ message: "License number already registered" });

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
    
    savedUser = await newUser.save(); 

    const newHospital = new Hospital({
      hospitalName,
      email,
      licenseNumber,
      contactNumber: phone,
      address,
      location: {
        type: "Point",
        coordinates: [lng, lat] 
      },
      capacity,
      hasEmergencyServices,
      operatingHours,
      adminUserId: savedUser._id
    });

    await newHospital.save();
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
    if (savedUser) {
        await User.findByIdAndDelete(savedUser._id);
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

// === 3. REQUEST BLOOD (Updated to return Donor Locations) ===
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
        }).select('fullName location bloodGroup email'); // Select only needed fields

        if (nearbyDonors.length === 0) {
            return res.status(200).json({ 
                message: "No compatible donors found nearby.",
                donorsFound: 0,
                donors: []
            });
        }

        // === SEND EMAILS ===
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
            emailsSent: successCount,
            donors: nearbyDonors // <--- SENDING DONOR DATA TO FRONTEND
        });

    } catch (error) {
        console.log("Error in requestBlood:", error.message);
        res.status(500).json({ message: "Server Error" });
    }
};



// === 4. UPDATE HOSPITAL LOCATION ===
export const updateHospitalLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    
    // Find the hospital managed by the logged-in user
    const hospital = await Hospital.findOne({ adminUserId: req.user._id });

    if (!hospital) {
        return res.status(404).json({ message: "Hospital profile not found" });
    }

    // Update the GeoJSON location
    hospital.location = {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)] // [Lng, Lat]
    };

    await hospital.save();

    res.status(200).json({ 
        message: "Hospital location updated successfully!", 
        location: hospital.location 
    });

  } catch (error) {
    console.log("Error in updateHospitalLocation:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};


export const updateInventory = async (req, res) => {
  try {
    const { inventory } = req.body; // Expecting object like { 'A+': 10, 'B-': 5 ... }
    
    const hospital = await Hospital.findOne({ adminUserId: req.user._id });

    if (!hospital) {
        return res.status(404).json({ message: "Hospital not found" });
    }

    // Update inventory
    hospital.inventory = inventory;
    
    // Recalculate total units automatically
    const total = Object.values(inventory).reduce((acc, curr) => acc + Number(curr), 0);
    hospital.totalBloodUnits = total;

    await hospital.save();

    res.status(200).json({ 
        message: "Inventory updated successfully!", 
        inventory: hospital.inventory,
        totalBloodUnits: hospital.totalBloodUnits
    });

  } catch (error) {
    console.log("Error in updateInventory:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};