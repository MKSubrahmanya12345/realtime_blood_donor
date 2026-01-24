import College from "../models/college.model.js";
import User from "../models/user.model.js";
import Event from "../models/event.model.js";
import bcrypt from "bcrypt";
import { generateToken } from "../lib/utils.js";

// === 1. REGISTER COLLEGE (Creates User + College Profile + RETURNS TOKEN) ===
export const registerCollege = async (req, res) => {
  let savedUser = null;

  try {
    const {
      collegeName,
      email,
      password,
      address,
      latitude,
      longitude
    } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: "Location is required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already registered" });

    // 1. Create User (Role: college)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName: collegeName,
      email,
      password: hashedPassword,
      role: "college",       
      isEmailVerified: true, 
      isPhoneVerified: true,
      // === FIX: SAVE LOCATION TO USER TOO ===
      address: address,
      location: {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)] 
      }
    });
    
    savedUser = await newUser.save(); 

    // 2. Create College Profile
    const newCollege = new College({
      collegeName,
      email,
      address,
      location: {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)] 
      },
      adminUserId: savedUser._id
    });

    await newCollege.save();
    
    // 3. Generate Token
    const token = generateToken(savedUser._id, res);

    res.status(201).json({
      _id: savedUser._id,
      email: savedUser.email,
      role: "college",
      fullName: savedUser.fullName, 
      collegeName: newCollege.collegeName,
      token, 
      message: "College Registered Successfully!"
    });

  } catch (error) {
    console.log("Error registerCollege:", error.message);
    if (savedUser) await User.findByIdAndDelete(savedUser._id); 
    res.status(500).json({ message: "Server Error" });
  }
};

// === 2. CREATE EVENT ===
export const createEvent = async (req, res) => {
  try {
    const { title, date, location } = req.body;

    // Find the College profile linked to this Admin
    const college = await College.findOne({ adminUserId: req.user._id });
    if (!college) {
      return res.status(404).json({ message: "College profile not found" });
    }

    const newEvent = new Event({
      title,
      date,
      location: location || college.address,
      collegeId: college._id
    });

    await newEvent.save();

    res.status(201).json({
      message: "Event Created Successfully!",
      event: newEvent
    });

  } catch (error) {
    console.log("Error createEvent:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// === 3. GET MY EVENTS (For College Dashboard) ===
export const getCollegeEvents = async (req, res) => {
  try {
    const college = await College.findOne({ adminUserId: req.user._id });
    if (!college) {
      return res.status(404).json({ message: "College not found" });
    }

    const events = await Event
      .find({ collegeId: college._id })
      .sort({ date: 1 });

    res.status(200).json(events);

  } catch (error) {
    console.log("Error getCollegeEvents:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// === 4. GET ACTIVE EVENTS FOR TODAY (For Student / Kiosk View) ===
export const getActiveEvents = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const events = await Event.find({
      date: {
        $gte: today,
        $lt: tomorrow
      }
    }).populate("collegeId", "collegeName address");

    res.status(200).json(events);

  } catch (error) {
    console.log("Error getActiveEvents:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};


export const getAllColleges = async (req, res) => {
  try {
    // Fetch only the name and ID to be lightweight
    const colleges = await College.find({}, "collegeName _id").sort({ collegeName: 1 });
    res.status(200).json(colleges);
  } catch (error) {
    console.log("Error getAllColleges:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

