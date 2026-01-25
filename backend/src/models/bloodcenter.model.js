import mongoose from "mongoose";

const bloodCenterSchema = new mongoose.Schema({
  state: { type: String, required: true },
  district: { type: String, required: true },
  city: { type: String, required: true },
  name: { type: String, required: true },
  parentHospital: String,
  contactPerson: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  licenseNumber: { type: String, required: true },
  donationTypes: [String], // Array for checkboxes
  componentTypes: [String],
}, { timestamps: true });

export const BloodCenter = mongoose.model("BloodCenter", bloodCenterSchema);