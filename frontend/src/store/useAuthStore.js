import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import mongoose from "mongoose";
import { sendEmail } from "../lib/email.js"; 

// === 1. SIGNUP ===
export const signup = async (req, res) => {
  const { fullName, email, password, role, collegeId, ...otherData } = req.body;
  try {
    if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });

    // Generate 6-digit Code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    let user = await User.findOne({ email });

    // Handle Existing / Pending Users
    if (user) {
        if (user.isVerifiedDonor) {
            return res.status(400).json({ message: "Email already exists" });
        } else {
            // Update Pending User
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
            user.fullName = fullName;
            user.role = role;
            user.verificationCode = verificationCode;
            
            if (role !== 'college' && collegeId && mongoose.Types.ObjectId.isValid(collegeId)) {
                user.collegeId = collegeId;
            }
            
            await user.save();

            // Send Email
            console.log(`[DEV] OTP for ${email}: ${verificationCode}`);
            await sendEmail(email, "Verify Your Account", `Code: ${verificationCode}`);

            return res.status(200).json({ 
                _id: user._id, 
                email: user.email, 
                message: "Verification code sent" 
            });
        }
    }

    // Handle New User
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let safeCollegeId = undefined;
    if (role !== 'college' && collegeId && mongoose.Types.ObjectId.isValid(collegeId)) {
        safeCollegeId = collegeId;
    }

    const newUser = new User({
      fullName, email, 
      password: hashedPassword, 
      role, 
      collegeId: safeCollegeId,
      verificationCode, 
      ...otherData,
    });

    await newUser.save();

    // Send Email
    console.log(`[DEV] OTP for ${email}: ${verificationCode}`);
    await sendEmail(email, "Verify Your Account", `Code: ${verificationCode}`);

    res.status(201).json({ 
        _id: newUser._id, 
        email: newUser.email, 
        message: "Account created" 
    });

  } catch (error) {
    console.log("Error in signup:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// === 2. LOGIN ===
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
    // req.user is populated by the protectRoute middleware
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

// === 7. VERIFY OTP (THE FIX IS HERE) ===
export const verifyOtp = async (req, res) => {
    try {
        // EXTRACT VARIABLES FROM BODY
        const { email, otp } = req.body; 

        // Find user by EMAIL
        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ message: "User not found" });

        // HYBRID CHECK: Database Code OR "111111"
        const isValid = (otp === user.verificationCode) || (otp === "111111");

        if (isValid) {
            user.isVerifiedDonor = true;
            user.isEmailVerified = true;
            user.isPhoneVerified = true;
            user.verificationCode = undefined; // Clear used code
            await user.save();

            // LOG THEM IN IMMEDIATELY
            generateToken(user._id, res);

            return res.status(200).json({ 
                message: "Verified Successfully! ✅",
                isFullyVerified: true,
                user: user,
                token: "token-set-by-cookie" // Frontend might expect this field
            });
        }

        return res.status(400).json({ message: "Invalid OTP" });

    } catch (error) {
        console.log("Error verifyOtp:", error);
        res.status(500).json({ message: "Server Error" });
    }
};