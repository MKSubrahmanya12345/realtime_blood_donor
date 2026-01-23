import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import { sendEmailOtp } from "../lib/email.js";

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const signup = async (req, res) => {
  const {
    fullName,
    email,
    password,
    phone,
    bloodGroup,
    address, // This captures the text "Bangalore"
    latitude, // This captures the number 12.97
    longitude, // This captures the number 77.59
    collegeName,
    collegeId,
  } = req.body;

  try {
    if (!fullName || !email || !password || !phone) {
      return res.status(400).json({ message: "All Fields must be Filled!" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const userExists = await User.findOne({ email });

    // === GEOJSON FORMATTING ===
    // MongoDB requires [Longitude, Latitude] order
    let locationData = undefined;
    if (latitude && longitude) {
        locationData = {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
        };
    }

    // === RETRY LOGIC (User Exists but Unverified) ===
    if (userExists) {
      const isVerified =
        userExists.isEmailVerified && userExists.isPhoneVerified;

      // Case 1: Fully verified user → block signup
      if (isVerified) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // Case 2: NOT verified → retry signup
      const emailOtp = generateOTP();
      const phoneOtp = generateOTP();

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      userExists.fullName = fullName;
      userExists.password = hashedPassword;
      userExists.phone = phone;
      userExists.bloodGroup = bloodGroup;
      userExists.address = address;       // Save text address
      userExists.location = locationData; // Save GeoJSON object
      userExists.collegeName = collegeName;
      userExists.collegeId = collegeId;
      userExists.emailOtp = emailOtp;
      userExists.phoneOtp = phoneOtp;
      userExists.otpExpires = Date.now() + 10 * 60 * 1000;

      await userExists.save();

      await sendEmailOtp(email, emailOtp);

      console.log(`=== RETRY OTP for ${email} ===`);
      console.log("Email OTP:", emailOtp);
      console.log("Phone OTP:", phoneOtp);

      return res.status(200).json({
        _id: userExists._id,
        email: userExists.email,
        message: "New OTPs generated! Please verify Email & Phone.",
      });
    }

    // === NEW USER CREATION ===
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const emailOtp = generateOTP();
    const phoneOtp = generateOTP();

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      phone,
      bloodGroup,
      address,       // Save text address
      location: locationData, // Save GeoJSON object
      collegeName,
      collegeId,
      emailOtp,
      phoneOtp,
      otpExpires: Date.now() + 10 * 60 * 1000, // 10 mins
      isEmailVerified: false,
      isPhoneVerified: false,
    });

    await newUser.save();
    
    // Send Email
    await sendEmailOtp(email, emailOtp);

    // DEV MODE: log OTPs
    console.log(`OTP for ${email}`);
    console.log("Email OTP:", emailOtp);
    console.log("Phone OTP:", phoneOtp);

    res.status(201).json({
      _id: newUser._id,
      email: newUser.email,
      message: "Signup successful. Please verify Email & Phone.",
    });
  } catch (error) {
    console.log("Error in signup handler", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ================= VERIFY OTP =================
export const verifyOtp = async (req, res) => {
  const { email, type, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.otpExpires < Date.now()) {
      return res
        .status(400)
        .json({ message: "OTP Expired. Please request a new one." });
    }

    if (type === "email") {
      if (user.emailOtp !== otp) {
        return res.status(400).json({ message: "Invalid Email OTP" });
      }
      user.isEmailVerified = true;
      user.emailOtp = undefined;
    } else if (type === "phone") {
      if (user.phoneOtp !== otp) {
        return res.status(400).json({ message: "Invalid Phone OTP" });
      }
      user.isPhoneVerified = true;
      user.phoneOtp = undefined;
    } else {
      return res.status(400).json({ message: "Invalid verification type" });
    }

    await user.save();

    const isFullyVerified =
      user.isEmailVerified && user.isPhoneVerified;

    if (isFullyVerified) {
      generateToken(user._id, res);
    }

    res.status(200).json({
      message: `${type} verified successfully`,
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified,
      isFullyVerified,
      user: isFullyVerified
        ? {
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            profilePic: user.profilePic,
          }
        : null,
    });
  } catch (error) {
    console.log("Error in verifyOtp", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ================= LOGIN =================
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.isEmailVerified || !user.isPhoneVerified) {
      return res
        .status(403)
        .json({ message: "Please verify Email and Phone first" });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ================= LOGOUT =================
export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ================= CHECK AUTH =================
export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ================= UPDATE PROFILE =================
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { 
      weight, 
      lastDonationDate, 
      medicalConditions, 
      medications, 
      hasTattoo,         
      recentSurgery,
    } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update fields
    if (weight) user.weight = weight;
    // Add logic here to update other fields as needed
    
    user.isProfileComplete = true; 

    await user.save();

    res.status(200).json({ 
      message: "Profile updated successfully", 
      user 
    });

  } catch (error) {
    console.log("Error in updateProfile:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const toggleAvailability = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.isAvailable = !user.isAvailable;
    await user.save();
    res.status(200).json({ isAvailable: user.isAvailable, message: "Status updated!" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};