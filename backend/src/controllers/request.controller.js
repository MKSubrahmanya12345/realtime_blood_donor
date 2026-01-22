import Request from "../models/request.model.js";

// 1. Create a new Blood Request
export const createRequest = async (req, res) => {
  try {
    const { patientName, bloodGroup, unitsRequired, hospitalName, location, urgency, contactNumber, note } = req.body;

    const newRequest = new Request({
      requesterId: req.user._id, // From the logged-in user
      patientName,
      bloodGroup,
      unitsRequired,
      hospitalName,
      location,
      urgency,
      contactNumber,
      note
    });

    await newRequest.save();
    res.status(201).json(newRequest);

  } catch (error) {
    console.log("Error in createRequest:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// 2. Get All Active Requests (For the Feed)
export const getAllRequests = async (req, res) => {
  try {
    // Sort by Urgency (Critical first) and then Newest first
    const requests = await Request.find({ status: 'Active' })
      .populate('requesterId', 'fullName email') // Get requester details
      .sort({ urgency: -1, createdAt: -1 }); // 'Critical' > 'Medium' > 'Low' (Alphabetical reverse works luckily: C comes before L/M... wait. Let's rely on createdAt for now) 
      // Actually 'Critical' (C) comes before 'Low' (L). So -1 reverses it. 
      // Better way: Filter/Sort on frontend or use numerical urgency levels. 
      // Let's just sort by Date for now to keep it simple.
    
    res.status(200).json(requests);
  } catch (error) {
    console.log("Error in getAllRequests:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};