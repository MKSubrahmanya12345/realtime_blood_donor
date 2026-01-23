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

const Request = mongoose.model("Request", requestSchema);
export default Request;
