import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      default: "pending",
    },
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    phone: {
      type: String,
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },
    collegeId: {
      type: String, 
    },
    collegeName: {
      type: String,
    },
    hospitalLicense: {
      type: String,
    },
    isProfileComplete: {
      type: Boolean,
      default: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    // === VITAL FIX: This field must exist for the code to save ===
    verificationCode: {
      type: String, 
    },
    // =============================================================
    
    otpExpires: {
      type: Date, 
    },
    address: { 
        type: String 
    }, 
    location: {
      type: { type: String},
      coordinates: { type: [Number], index: "2dsphere" }, 
    },
    isAvailable: { type: Boolean, default: true }, 
    lastDonationDate: { type: Date, default: null },
    isVerifiedDonor: { 
      type: Boolean, 
      default: false 
    },
  },
  {
    timestamps: true,
  },
);

userSchema.index({ location: "2dsphere" });

const User = mongoose.model("User", userSchema);
export default User;