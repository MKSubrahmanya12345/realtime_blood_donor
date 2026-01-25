import mongoose from "mongoose";

const bloodCenterSchema = new mongoose.Schema({
  state: { type: String, required: true },
  district: { type: String, required: true },
  city: { type: String, required: true },
  bloodBankName: { type: String, required: true },
  parentHospital: String,
  contactPerson: String,
  email: { type: String, required: true },
  contactNumber: { type: String, required: true },
  licenseNumber: String,
  donationTypes: [String], // Array to store multiple checkboxes
  componentTypes: [String]
}, { timestamps: true });

export const BloodCenter = mongoose.model("BloodCenter", bloodCenterSchema);