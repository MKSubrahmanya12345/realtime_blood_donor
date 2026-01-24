import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import { generateToken } from "../lib/utils.js";
import mongoose from "mongoose";

// === 1. SIGNUP (MERGED & SAFER) ===
export const signup = async (req, res) => {
  const { fullName, email, password, role, collegeId, ...otherData } = req.body;

  try {
    // 1. Password Check
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // 2. Duplicate Email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // 3. Duplicate College Name
    if (role === "college") {
      const existingCollege = await User.findOne({ fullName });
      if (existingCollege) {
        return res.status(400).json({ message: "A college with this name is already registered." });
      }
    }

    // 4. Safe College ID Handling
    let safeCollegeId = undefined;

    if ((role === "student" || role === "donor") && collegeId) {
      if (mongoose.Types.ObjectId.isValid(collegeId)) {
        safeCollegeId = collegeId;
      } else {
        console.log(`[Warning] Ignored invalid College ID: ${collegeId}`);
      }
    }

    // 5. Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      role,
      collegeId: safeCollegeId,
      ...otherData
    });

    await newUser.save();

    // 6. Generate Token
    generateToken(newUser._id, res);

    res.status(201).json({
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      role: newUser.role,
      collegeId: newUser.collegeId
    });

  } catch (error) {
    console.log("Error in signup controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// === 2. CHECK AUTH (MERGED) ===
export const checkAuth = (req, res) => {
  try {
    // protectRoute already populated req.user
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
