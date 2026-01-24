import Event from "../models/event.model.js";
import User from "../models/user.model.js";

// === 1. CREATE EVENT (Colleges Only) ===
// === 1. CREATE EVENT (Auto-Fill Version) ===
export const createEvent = async (req, res) => {
  try {
    const { title, description, date, numberOfDays } = req.body;

    // Validation
    if (!title || !description || !date) {
        return res.status(400).json({ message: "Please fill Title, Description, and Date." });
    }

    // === BORROW DETAILS FROM LOGGED-IN COLLEGE ===
    // We prioritize req.user data over req.body
    const collegeLocation = req.user.address || req.user.location || "College Campus";
    const collegeName = req.user.collegeName || req.user.fullName || "College Admin";
    const collegePhone = req.user.phone || req.user.contactNumber || "N/A";

    const newEvent = new Event({
      title,
      description,
      date,
      numberOfDays: numberOfDays || 1,
      
      // Auto-filled details
      location: collegeLocation,
      organizerName: collegeName,
      contactNumber: collegePhone,
      
      collegeId: req.user._id, 
      participants: []
    });

    await newEvent.save();
    res.status(201).json(newEvent);

  } catch (error) {
    console.log("Error createEvent:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// === 2. GET ALL EVENTS (Public - For Donors) ===
export const getAllEvents = async (req, res) => {
  try {

    if (!req.user) {
        return res.status(200).json([]); // Or throw error: "Please login to see events"
    }

    if (req.user.role === 'college') {
        const events = await Event.find({ collegeId: req.user._id }).sort({ date: 1 });
        return res.status(200).json(events);
    }

    if (req.user.collegeId) {
        const events = await Event.find({ collegeId: req.user.collegeId }).sort({ date: 1 });
        return res.status(200).json(events);
    }
    
    const events = await Event.find().sort({ date: 1 });
    res.status(200).json(events);
  } catch (error) {
    console.log("Error getAllEvents:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// === 3. GET MY EVENTS (Private - For College Dashboard) ===
export const getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ collegeId: req.user._id }).sort({ date: 1 });
    res.status(200).json(events);
  } catch (error) {
    console.log("Error getMyEvents:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// === 4. JOIN EVENT (Student Registration + Auto-Verification) ===
export const joinEvent = async (req, res) => {
  try {
    const eventId = req.params.id || req.body.eventId;
    const userId = req.user._id;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    // Prevent duplicate joins
    if (event.participants.includes(userId)) {
      return res.status(400).json({ message: "You are already registered." });
    }

    // 1. Add User to Event
    event.participants.push(userId);
    await event.save();

    // 2. AUTO-VERIFY USER
    const user = await User.findById(userId);

    let message = "Registered successfully!";

    if (!user.isVerifiedDonor) {
      user.isVerifiedDonor = true;

      if (user.role === "pending" || !user.role) {
        user.role = "donor";
      }

      await user.save();
      message = "Registered & Account Verified!";
    }

    res.status(200).json({
      message,
      isVerifiedDonor: true,
      event
    });

  } catch (error) {
    console.log("Error joinEvent:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// === 5. UPDATE EVENT (College Edit) ===
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Ensure ownership
    const event = await Event.findOne({ _id: id, collegeId: req.user._id });

    if (!event) {
      return res.status(404).json({ message: "Event not found or unauthorized" });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    );

    res.status(200).json(updatedEvent);

  } catch (error) {
    console.log("Error in updateEvent:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


// === 6. LEAVE EVENT (Unregister) ===
export const leaveEvent = async (req, res) => {
  try {
    const eventId = req.params.id || req.body.eventId;
    const userId = req.user._id;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    // Check if not registered
    if (!event.participants.includes(userId)) {
      return res.status(400).json({ message: "You are not registered for this event." });
    }

    // Remove User from Event using $pull
    event.participants = event.participants.filter(
        (id) => id.toString() !== userId.toString()
    );
    
    await event.save();

    res.status(200).json({ 
        message: "Successfully unregistered from the event.", 
        event 
    });

  } catch (error) {
    console.log("Error leaveEvent:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};