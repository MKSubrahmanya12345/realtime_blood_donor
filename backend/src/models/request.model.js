import mongoose from "mongoose";

const requestSchema = new mongoose.Schema(
  {
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    patientName: { type: String, required: true },
    bloodGroup: {
      type: String,
      required: true,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },
    unitsRequired: { type: Number, required: true, default: 1 },
    hospitalName: { type: String, required: true },
    location: { type: String, required: true },
    latitude: { type: Number }, 
    longitude: { type: Number },
    urgency: {
      type: String,
      enum: ["Low", "Medium", "Critical"],
      default: "Medium",
    },
    contactNumber: { type: String, required: true },
    status: {
      type: String,
      enum: ["Active", "Fulfilled", "Closed"],
      default: "Active",
    },
    note: { type: String },
  },
  { timestamps: true },
);


export const getStats = async (req, res) => {
  try {
    // 1. Count Total Donors (role = 'donor')
    const totalDonors = await User.countDocuments({ role: "donor" });

    // 2. Count Active Requests (Emergencies happening right now)
    const activeRequests = await Request.countDocuments({ status: "Active" });

    // 3. Lives Saved (Fulfilled Requests)
    // We assume 1 Request Fulfilled = 1 Life Impacted (conservative estimate)
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

const Request = mongoose.model("Request", requestSchema);




export default Request;
