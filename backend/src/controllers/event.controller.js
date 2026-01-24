import Event from "../models/event.model.js";
import User from "../models/user.model.js";

// === 1. CREATE EVENT (Hospitals Only) ===
export const createEvent = async (req, res) => {
  try {
    const { title, description, date, location, latitude, longitude, collegeName } = req.body;

    const newEvent = new Event({
      title,
      description,
      date,
      location,
      latitude,
      longitude,
      collegeName,
      organizerId: req.user._id,
      organizationName: req.user.fullName // or hospitalName if available
    });

    await newEvent.save();
    res.status(201).json(newEvent);

  } catch (error) {
    console.log("Error createEvent:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// === 2. GET ALL EVENTS (Public) ===
export const getEvents = async (req, res) => {
  try {
    // Sort by date (nearest first)
    const events = await Event.find({ status: { $ne: "Completed" } }).sort({ date: 1 });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// === 3. REGISTER FOR EVENT (AUTO-VERIFICATION) ===
export const registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.body;
    const userId = req.user._id;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    // Check if already registered
    if (event.participants.includes(userId)) {
      return res.status(400).json({ message: "You are already registered." });
    }

    // 1. Add User to Event
    event.participants.push(userId);
    await event.save();

    // 2. AUTO-VERIFY THE USER
    // Logic: If you register for a college event, we trust you are real.
    const user = await User.findById(userId);
    
    let message = "Registered successfully!";
    
    if (!user.isVerifiedDonor) {
        user.isVerifiedDonor = true; // <--- THE MAGIC
        user.role = "donor";         // Ensure they are a donor
        
        // Optional: Auto-verify email/phone if event is "Trusted"
        // user.isEmailVerified = true; 
        
        await user.save();
        message = "Registered & Account Verified!";
    }

    res.status(200).json({ 
        message, 
        isVerifiedDonor: true,
        event 
    });

  } catch (error) {
    console.log("Error registerEvent:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};