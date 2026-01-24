import Hospital from "../models/hospital.model.js";
import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import { generateToken } from "../lib/utils.js";
import { sendEmergencyEmail } from "../lib/email.js";
import { io, getReceiverSocketId } from "../lib/socket.js";
import Notification from "../models/notification.model.js"; // <--- Add this

// === 1. ONE-SHOT REGISTER (Create User + Hospital) ===
export const registerHospital = async (req, res) => {
  let savedUser = null;

  try {
    const {
      fullName,
      email,
      password,
      phone,
      hospitalName,
      licenseNumber,
      address,
      latitude,
      longitude,
      capacity,
      hasEmergencyServices,
      operatingHours
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
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const existingHospital = await Hospital.findOne({ licenseNumber });
    if (existingHospital) {
      return res.status(400).json({ message: "License number already registered" });
    }

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

    if (!hospital) {
      return res.status(404).json({ message: "Hospital profile not found" });
    }

    res.status(200).json(hospital);

  } catch (error) {
    console.log("Error in getMyHospital:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// === 3. REQUEST BLOOD (EMAIL + SOCKET ALERTS) ===
export const requestBlood = async (req, res) => {
  try {
    const { bloodGroup, units } = req.body;

    const hospital = await Hospital.findOne({ adminUserId: req.user._id });
    if (!hospital) {
      return res.status(404).json({ message: "Hospital profile not found." });
    }

    if (!hospital.location || !hospital.location.coordinates) {
      return res.status(400).json({ message: "Hospital location missing." });
    }

    console.log(`🔎 Searching for ${bloodGroup} donors near ${hospital.hospitalName}...`);

    // === 10KM SEARCH ===
    const nearbyDonors = await User.find({
      role: "donor",
      bloodGroup,
      isAvailable: true,
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: hospital.location.coordinates
          },
          $maxDistance: 10000
        }
      }
    }).select("fullName email bloodGroup location");

    if (nearbyDonors.length === 0) {
      return res.status(200).json({
        message: "No compatible donors found nearby.",
        donorsFound: 0,
        donors: []
      });
    }

    console.log(`📍 Found ${nearbyDonors.length} donors`);

    // ... inside requestBlood function ...

        // ... inside requestBlood ...
        
        // === SEND ALERTS (Socket, Email, & DB) ===
        const results = await Promise.allSettled(nearbyDonors.map(async (donor) => {
            
            // A. Create DB Notification
            const newNotification = new Notification({
                recipientId: donor._id,
                senderId: req.user._id,
                type: 'emergency',
                title: `URGENT: ${bloodGroup} Blood Needed`,
                message: `${hospital.hospitalName} requires ${units} units of ${bloodGroup} blood.`,
                metadata: {
                    hospitalId: hospital._id,
                    bloodGroup,
                    units,
                    location: hospital.location
                }
            });
            await newNotification.save();

            // B. Send Socket Alert (Send the DB ID too!)
            const socketId = getReceiverSocketId(donor._id.toString());
            if (socketId) {
                io.to(socketId).emit("emergencyRequest", {
                    _id: newNotification._id, 
                    hospitalName: hospital.hospitalName,
                    bloodGroup,
                    units,
                    location: hospital.location,
                    message: newNotification.message
                });
            }

            // C. Send Email
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

        // ... rest of function 

    // === EMAILS + SOCKET ALERTS ===
    const emailResults = await Promise.allSettled(
      nearbyDonors.map(donor => {

        // 1️⃣ SOCKET ALERT
        const socketId = getReceiverSocketId(donor._id.toString());

        if (socketId) {
          io.to(socketId).emit("emergencyRequest", {
            hospitalName: hospital.hospitalName,
            bloodGroup,
            units,
            location: hospital.address,
            message: `URGENT: ${hospital.hospitalName} needs ${bloodGroup} blood!`
          });

          console.log(`📡 Socket alert sent to ${donor.fullName}`);
        } else {
          console.log(`⚠️ Donor ${donor.fullName} is offline (no socket)`);
        }

        // 2️⃣ EMAIL ALERT
        return sendEmergencyEmail(
          donor.email,
          donor.fullName,
          hospital.hospitalName,
          bloodGroup,
          units,
          hospital.address,
          hospital.contactNumber
        );
      })
    );

    const successCount = emailResults.filter(r => r.status === "fulfilled").length;
    const failCount = emailResults.filter(r => r.status === "rejected").length;

    console.log(`📧 Emails: ${successCount} sent, ${failCount} failed`);

    res.status(200).json({
      message: "Emergency broadcast sent successfully!",
      donorsFound: nearbyDonors.length,
      emailsSent: successCount,
      donors: nearbyDonors
    });

  } catch (error) {
    console.log("💥 Error in requestBlood:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// === 4. UPDATE HOSPITAL LOCATION ===
export const updateHospitalLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    const hospital = await Hospital.findOne({ adminUserId: req.user._id });
    if (!hospital) {
      return res.status(404).json({ message: "Hospital profile not found" });
    }

    hospital.location = {
      type: "Point",
      coordinates: [parseFloat(longitude), parseFloat(latitude)]
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

// === 5. UPDATE BLOOD INVENTORY ===
export const updateInventory = async (req, res) => {
  try {
    const { inventory } = req.body;

    const hospital = await Hospital.findOne({ adminUserId: req.user._id });
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    hospital.inventory = inventory;

    const total = Object.values(inventory).reduce(
      (acc, curr) => acc + Number(curr),
      0
    );

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
