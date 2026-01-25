import Request from "../models/request.model.js";
import User from "../models/user.model.js";
import { sendEmergencyEmail } from "../lib/email.js";
import { io, getReceiverSocketId } from "../lib/socket.js";


// backend/src/controllers/request.controller.js

const bloodCompatibility = {
    "O-": ["O-"], // O- patients can only receive from O-
    "O+": ["O+", "O-"], 
    "A-": ["A-", "O-"],
    "A+": ["A+", "A-", "O+", "O-"],
    "B-": ["B-", "O-"],
    "B+": ["B+", "B-", "O+", "O-"],
    "AB-": ["AB-", "A-", "B-", "O-"],
    "AB+": ["AB+", "AB-", "A+", "A-", "B+", "B-", "O+", "O-"] 
};

// DEBUG VERSION: Create Request & Notify
export const createRequest = async (req, res) => {
  console.log("---------------------------------------");
  console.log("🚀 PROCESSING BLOOD REQUEST");

  try {
    const { 
      patientName, bloodGroup, unitsRequired, 
      hospitalName, location, urgency, 
      contactNumber, note,
      latitude, longitude 
    } = req.body;

    // LOG 1: Did we get the data?
    console.log("1. Payload Received:", { bloodGroup, location });
    console.log("   GPS Coords:", latitude, longitude);

    if (!latitude || !longitude) {
      console.log("❌ ERROR: No GPS coordinates received from Frontend!");
    }

    // 1. Save Request
    const newRequest = new Request({
      requesterId: req.user._id,
      patientName,
      bloodGroup,
      unitsRequired,
      hospitalName,
      location,
      latitude,
      longitude,
      urgency,
      contactNumber,
      note
    });

    await newRequest.save();
    console.log("2. Request Saved to Database ✅");

    const compatibleGroups = bloodCompatibility[bloodGroup] || [bloodGroup];

    // 2. Search Donors
    if (latitude && longitude) {
      console.log(`3. Searching for [${bloodGroup}] donors near [${longitude}, ${latitude}]...`);
        
      const nearbyDonors = await User.find({
        role: 'donor',
        bloodGroup: { $in: compatibleGroups },
        isAvailable: true,
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [parseFloat(longitude), parseFloat(latitude)]
            },
            $maxDistance: 10000 // 10km
          }
        }
      });

      console.log(`4. Donors Found: ${nearbyDonors.length}`);

      if (nearbyDonors.length === 0) {
        console.log("⚠️ No donors found nearby. (Check your dummy donor location!)");
      } else {
        console.log("5. Sending Emails + Socket Alerts to:");
        nearbyDonors.forEach(d => console.log(`   -> 📧 ${d.email}`));

        // 3A. Send Emails (Existing)
        const emailResults = await Promise.allSettled(
          nearbyDonors.map(donor => {
            return sendEmergencyEmail(
              donor.email,
              donor.fullName,
              hospitalName,
              bloodGroup,
              unitsRequired,
              location,
              contactNumber
            );
          })
        );

        const successes = emailResults.filter(r => r.status === 'fulfilled').length;
        const failures = emailResults.filter(r => r.status === 'rejected').length;
        console.log(`6. Email Status: ${successes} Sent, ${failures} Failed.`);

        // 3B. Send Real-Time Socket Alerts (NEW)
        nearbyDonors.forEach(donor => {
          const socketId = getReceiverSocketId(donor._id.toString());

          if (socketId) {
            io.to(socketId).emit("emergencyRequest", {
              requestId: newRequest._id,
              hospitalName,
              bloodGroup,
              unitsRequired,
              urgency,
              location,
              latitude,
              longitude,
              contactNumber,
              message: `URGENT: ${hospitalName} needs ${bloodGroup} blood!`
            });

            console.log(`🔔 Socket Alert sent to ${donor.fullName}`);
          } else {
            console.log(`💤 ${donor.fullName} is offline (no socket)`);
          }
        });
      }
    }

    res.status(201).json({
      request: newRequest,
      message: "Request posted!"
    });

  } catch (error) {
    console.log("💥 CRITICAL ERROR:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// 2. Get All Requests (No changes needed here)
export const getAllRequests = async (req, res) => {
  try {
    const requests = await Request.find({ status: 'Active' })
      .populate('requesterId', 'fullName email') 
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};


export const getStats = async (req, res) => {
  try {
    // 1. Count Total Donors (We assume 'individual' or 'student' are donors)
    // Adjust the query if your roles are different (e.g., role: "donor")
    const totalDonors = await User.countDocuments({ role: { $in: ["donor", "individual", "student"] } });

    // 2. Count Active Requests
    const activeRequests = await Request.countDocuments({ status: "Active" });

    // 3. Lives Saved (Fulfilled Requests)
    const fulfilledRequests = await Request.countDocuments({ status: "Fulfilled" });

    res.status(200).json({
      donors: totalDonors,
      active: activeRequests,
      livesSaved: fulfilledRequests
    });

  } catch (error) {
    console.log("Error fetching stats:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};