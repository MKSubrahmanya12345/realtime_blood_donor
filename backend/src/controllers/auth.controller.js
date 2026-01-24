import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import mongoose from "mongoose";
import { sendEmail } from "../lib/email.js"; // Import Email Helper

// === 1. SIGNUP (Hybrid: Sends Real Email + Updates Pending Users) ===
export const signup = async (req, res) => {
  const { fullName, email, password, role, collegeId, ...otherData } = req.body;
  try {
    if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });

    // 1. Generate a REAL 6-digit Code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. Check Existing User
    let user = await User.findOne({ email });

    if (user) {
        if (user.isVerifiedDonor) {
            return res.status(400).json({ message: "Email already exists" });
        } else {
            // === PENDING USER: UPDATE & RESEND ===
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
            user.fullName = fullName;
            user.role = role;
            user.verificationCode = verificationCode; // Save New Code
            
            // Update College ID if valid
            if (role !== 'college' && collegeId && mongoose.Types.ObjectId.isValid(collegeId)) {
                user.collegeId = collegeId;
            }
            
            await user.save();

            // LOG CODE (Backup for Dev)
            console.log(`[DEV] Real OTP for ${email}: ${verificationCode}`);

            // SEND REAL EMAIL
            await sendEmail(email, "Verify Your Account", `Code: ${verificationCode}`);

            return res.status(200).json({ 
                _id: user._id, email: user.email, role: user.role, 
                message: "Verification code resent" 
            });
        }
    }

    // 3. NEW USER
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Safe College ID Check
    let safeCollegeId = undefined;
    if (role !== 'college' && collegeId && mongoose.Types.ObjectId.isValid(collegeId)) {
        safeCollegeId = collegeId;
    }

    const newUser = new User({
      fullName, email, 
      password: hashedPassword, 
      role, 
      collegeId: safeCollegeId,
      verificationCode, // Save Real Code
      ...otherData,
    });

    await newUser.save();

    // LOG CODE (Backup for Dev)
    console.log(`[DEV] Real OTP for ${email}: ${verificationCode}`);

    // SEND REAL EMAIL
    await sendEmail(email, "Verify Your Account", `Code: ${verificationCode}`);

    res.status(201).json({ 
        _id: newUser._id, email: newUser.email, role: newUser.role,
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
    res.status(200).json({ 
        _id: user._id, 
        fullName: user.fullName, 
        email: user.email, 
        role: user.role, 
        collegeId: user.collegeId 
    });

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

// === 7. VERIFY OTP (Checks REAL Code OR 111111) ===
export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body; 
        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ message: "User not found" });

        // === THE HYBRID CHECK ===
        // Allow if OTP matches the DB code OR if it is the Magic 111111
        const isValid = (otp === user.verificationCode) || (otp === "111111");

        if (isValid) {
            user.isVerifiedDonor = true;
            user.isEmailVerified = true;
            user.isPhoneVerified = true;
            user.verificationCode = undefined; // Clear code after use
            await user.save();

            // LOG IN IMMEDIATELY
            generateToken(user._id, res);

            return res.status(200).json({ 
                message: "Verified Successfully! ✅",
                isFullyVerified: true,
                user: user,
            });
        }

        return res.status(400).json({ message: "Invalid OTP" });

    } catch (error) {
        console.log("Error verifyOtp:", error);
        res.status(500).json({ message: "Server Error" });
    }
};