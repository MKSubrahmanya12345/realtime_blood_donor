import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import mongoose from "mongoose";
import { sendEmail } from "../lib/email.js"; 

// === 1. SIGNUP ===
export const signup = async (req, res) => {
  const { fullName, email, password, role, collegeId, phone, bloodGroup, ...otherData } = req.body;

  try {
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Generate Code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Check Existing User
    let user = await User.findOne({ email });

    if (user) {
      if (user.isVerifiedDonor) {
        return res.status(400).json({ message: "Email already exists" });
      } else {
        // Update Pending User
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.fullName = fullName;
        user.role = role || user.role || "pending";
        user.verificationCode = verificationCode; // SAVES NOW because we fixed the model
        user.phone = phone;
        user.bloodGroup = bloodGroup;

        if (role !== "college" && collegeId && mongoose.Types.ObjectId.isValid(collegeId)) {
          user.collegeId = collegeId;
        }

        await user.save();

        console.log(`[DEV] Signup OTP for ${email}: ${verificationCode}`);

        sendEmail(email, "Verify Your Account", `Code: ${verificationCode}`)
          .catch(err => console.error("Email Failed:", err.message));

        return res.status(200).json({
          _id: user._id,
          email: user.email,
          role: user.role,
          message: "Verification code sent",
        });
      }
    }

    // New User
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const safeCollegeId = role !== "college" && collegeId && mongoose.Types.ObjectId.isValid(collegeId)
      ? collegeId
      : undefined;

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      role: role || "pending",
      collegeId: safeCollegeId,
      verificationCode, // This matches the Schema now
      phone,
      bloodGroup,
      ...otherData,
    });

    await newUser.save();

    console.log(`[DEV] Signup OTP for ${email}: ${verificationCode}`);

    sendEmail(email, "Verify Your Account", `Code: ${verificationCode}`)
      .catch(err => console.error("Email Failed:", err.message));

    res.status(201).json({
      _id: newUser._id,
      email: newUser.email,
      role: newUser.role,
      message: "Account created. Verify email next.",
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

// === 7. VERIFY OTP (THE FIX) ===
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp, type } = req.body;

    if (!email || !otp || !type) {
      return res.status(400).json({ message: "Missing email, otp, or type" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // === STEP 1: EMAIL VERIFICATION ===
    if (type === "email") {
      // Compare with the code stored in DB
      if (otp !== user.verificationCode) {
        return res.status(400).json({ message: "Invalid Email OTP" });
      }

      // SUCCESS: Set a temporary cookie proving they passed email
      // DO NOT SAVE TO DB YET
      res.cookie("email_verified_proof", "true", { 
        httpOnly: true, 
        maxAge: 15 * 60 * 1000 // 15 mins validity
      });

      // Send fake success to frontend so UI updates
      return res.status(200).json({
        message: "Email Verified! Please verify phone.",
        user: { ...user.toObject(), isEmailVerified: true }
      });
    }

    // === STEP 2: PHONE VERIFICATION ===
    else if (type === "phone") {
      // 1. Check Phone OTP (Hardcoded for testing)
      if (otp !== "111111") {
        return res.status(400).json({ message: "Invalid Phone OTP" });
      }

      // 2. CHECK COOKIE: Did they verify email?
      if (!req.cookies.email_verified_proof && !user.isEmailVerified) {
        return res.status(400).json({ message: "Please verify email first!" });
      }

      // 3. FINAL SAVE: Both steps passed
      user.isEmailVerified = true;
      user.isPhoneVerified = true;
      user.isVerifiedDonor = true; // Activate account
      user.verificationCode = undefined; // Clear code

      await user.save();

      // Clear the temporary cookie
      res.clearCookie("email_verified_proof");

      // Generate Login Token
      generateToken(user._id, res);

      return res.status(200).json({
        message: "Registration Complete! ✅",
        isFullyVerified: true,
        user: user,
      });
    } else {
      return res.status(400).json({ message: "Invalid verification type" });
    }

  } catch (error) {
    console.error("Error in verifyOtp:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const resendEmailOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.isEmailVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationCode = newOtp; // Correct field now
    await user.save();

    sendEmail(email, "Verify Your Account", `Code: ${newOtp}`)
      .catch(err => console.error("Email Failed:", err.message));

    console.log(`[DEV] Resent OTP for ${email}: ${newOtp}`);

    res.status(200).json({ message: "Verification code resent successfully" });
  } catch (error) {
    console.log("Error in resendEmailOtp:", error);
    res.status(500).json({ message: "Server Error" });
  }
};