import Request from "../models/request.model.js";
import User from "../models/user.model.js";
import { sendEmergencyEmail } from "../lib/email.js"; // Import Email Logic

// 1. Create a new Blood Request AND Notify Donors
export const createRequest = async (req, res) => {
  try {
    const { 
        patientName, bloodGroup, unitsRequired, 
        hospitalName, location, urgency, 
        contactNumber, note,
        latitude, longitude // <--- Captured from Frontend
    } = req.body;

    // 1. Save the Request to Database
    const newRequest = new Request({
      requesterId: req.user._id,
      patientName,
      bloodGroup,
      unitsRequired,
      hospitalName,
      location, // Text address
      urgency,
      contactNumber,
      note
    });
    await newRequest.save();

    // 2. SEARCH NEIGHBORING DONORS
    // Only if we have valid coordinates
    if (latitude && longitude) {
        console.log(`Searching for ${bloodGroup} donors near ${location}...`);
        
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
                    $maxDistance: 10000 // 10km radius
                }
            }
        });

        console.log(`Found ${nearbyDonors.length} donors.`);

        // 3. SEND EMAILS (Async - Don't wait for all to finish)
        Promise.allSettled(nearbyDonors.map(donor => {
            return sendEmergencyEmail(
                donor.email,
                donor.fullName,
                hospitalName, // Passing Hospital Name
                bloodGroup,
                unitsRequired,
                location,     // Passing Address
                contactNumber
            );
        }));
    }

    res.status(201).json({
        request: newRequest,
        message: "Request posted and donors notified!"
    });

  } catch (error) {
    console.log("Error in createRequest:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// 2. Get All Active Requests
export const getAllRequests = async (req, res) => {
  try {
    const requests = await Request.find({ status: 'Active' })
      .populate('requesterId', 'fullName email') 
      .sort({ createdAt: -1 });
    
    res.status(200).json(requests);
  } catch (error) {
    console.log("Error in getAllRequests:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};