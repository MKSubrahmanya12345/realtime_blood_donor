import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import mongoose from "mongoose";

// === 1. SIGNUP ===
export const signup = async (req, res) => {
  const { fullName, email, password, role, collegeId, ...otherData } = req.body;
  try {
    if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });

    const user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "Email already exists" });

    if (role === "college") {
        const existingCollege = await User.findOne({ fullName: fullName });
        if (existingCollege) return res.status(400).json({ message: "College name already registered." });
    }

    let safeCollegeId = undefined;
    if ((role === 'student' || role === 'donor') && collegeId && mongoose.Types.ObjectId.isValid(collegeId)) {
        safeCollegeId = collegeId;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName, email, password: hashedPassword, role, collegeId: safeCollegeId, ...otherData,
    });

    await newUser.save();
    generateToken(newUser._id, res);
    res.status(201).json({ _id: newUser._id, fullName: newUser.fullName, email: newUser.email, role: newUser.role });

  } catch (error) {
    console.log("Error in signup:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// === 2. LOGIN (THIS IS THE MISSING PART) ===
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid credentials" });

    generateToken(user._id, res);
    res.status(200).json({ _id: user._id, fullName: user.fullName, email: user.email, role: user.role, collegeId: user.collegeId });

  } catch (error) {
    console.log("Error in login:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// === 3. LOGOUT ===
export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// === 4. CHECK AUTH ===
export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// === 5. UPDATE PROFILE ===
export const updateProfile = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.user._id, req.body, { new: true });
    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("Error in updateProfile:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// === 6. TOGGLE AVAILABILITY ===
export const toggleAvailability = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        user.isAvailable = !user.isAvailable;
        await user.save();
        res.status(200).json({ isAvailable: user.isAvailable });
    } catch (error) {
        console.log("Error toggleAvailability:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// === 7. VERIFY OTP ===
export const verifyOtp = async (req, res) => {

    if (otp === "111111") {
            // Optional: If you want to mark the user as verified in DB immediately
            if (userId) {
                await User.findByIdAndUpdate(userId, { isVerifiedDonor: true });
            }
            
            return res.status(200).json({ message: "OTP Verified Successfully! ✅" });
        }

};