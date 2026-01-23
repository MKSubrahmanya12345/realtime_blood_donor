import Request from "../models/request.model.js";
import User from "../models/user.model.js";
import { sendEmergencyEmail } from "../lib/email.js";

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

    // 2. Search Donors
    if (latitude && longitude) {
        console.log(`3. Searching for [${bloodGroup}] donors near [${longitude}, ${latitude}]...`);
        
        const nearbyDonors = await User.find({
            role: 'donor',
            bloodGroup: bloodGroup,
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
            console.log("5. Sending Emails to:");
            nearbyDonors.forEach(d => console.log(`   -> 📧 ${d.email}`));
            
            // Send Emails
            const results = await Promise.allSettled(nearbyDonors.map(donor => {
                return sendEmergencyEmail(
                    donor.email,
                    donor.fullName,
                    hospitalName,
                    bloodGroup,
                    unitsRequired,
                    location,
                    contactNumber
                );
            }));
            
            // LOG EMAIL RESULTS
            const successes = results.filter(r => r.status === 'fulfilled').length;
            const failures = results.filter(r => r.status === 'rejected').length;
            console.log(`6. Email Status: ${successes} Sent, ${failures} Failed.`);
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