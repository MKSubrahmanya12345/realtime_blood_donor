import Event from "../models/event.model.js";
import User from "../models/user.model.js";

// === 1. CREATE EVENT (Features: Auto-Fill College Details) ===
export const createEvent = async (req, res) => {
  try {
    const { title, description, date, numberOfDays } = req.body;

    if (!title || !description || !date) {
        return res.status(400).json({ message: "Please fill Title, Description, and Date." });
    }

    // Feature: Auto-fill details from the logged-in college user
    const collegeLocation = req.user.address || req.user.location || "College Campus";
    const collegeName = req.user.collegeName || req.user.fullName || "College Admin";
    const collegePhone = req.user.phone || req.user.contactNumber || "N/A";

    const newEvent = new Event({
      title,
      description,
      date,
      numberOfDays: numberOfDays || 1,
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

// === 2. GET ALL EVENTS (Public) ===
export const getAllEvents = async (req, res) => {
  try {
    if (!req.user) return res.status(200).json([]);

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

// === 3. GET MY EVENTS (Private) ===
export const getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ collegeId: req.user._id }).sort({ date: 1 });
    res.status(200).json(events);
  } catch (error) {
    console.log("Error getMyEvents:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// === 4. GET EVENT PARTICIPANTS ===
export const getEventParticipants = async (req, res) => {
    try {
        const { id } = req.params;

        // Ensure the college requesting owns this event
        const event = await Event.findOne({ _id: id, collegeId: req.user._id })
            .populate("participants", "fullName email phone bloodGroup isVerifiedDonor role");

        if (!event) {
            return res.status(404).json({ message: "Event not found or unauthorized" });
        }

        res.status(200).json(event.participants);
    } catch (error) {
        console.log("Error getEventParticipants:", error.message);
        res.status(500).json({ message: "Server Error" });
    }
};

// === 5. JOIN EVENT (Features: Auto-Verify on Registration) ===
export const joinEvent = async (req, res) => {
  try {
    const eventId = req.params.id || req.body.eventId;
    const userId = req.user._id;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event.participants.includes(userId)) {
      return res.status(400).json({ message: "You are already registered." });
    }

    event.participants.push(userId);
    await event.save();

    // Feature: Auto-verify user upon joining (retained from current code)
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

    res.status(200).json({ message, isVerifiedDonor: true, event });

  } catch (error) {
    console.log("Error joinEvent:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// === 6. MARK STUDENT AS DONATED (NEW FEATURE) ===
export const markAsDonated = async (req, res) => {
    try {
        const { id } = req.params; // Event ID
        const { studentId } = req.body;

        const event = await Event.findOne({ _id: id, collegeId: req.user._id });
        if (!event) return res.status(404).json({ message: "Event not found or unauthorized" });

        if (!event.participants.includes(studentId)) {
            return res.status(400).json({ message: "Student is not registered for this event" });
        }

        // Update User Status: Mark Verified AND Set Last Donation Date
        const user = await User.findById(studentId);
        if (user) {
            user.isVerifiedDonor = true;
            user.lastDonationDate = new Date(); // New tracking feature
            await user.save();
        }

        res.status(200).json({ message: "Student marked as donated", success: true });
    } catch (error) {
        console.log("Error markAsDonated:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// === 7. UPDATE EVENT ===
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

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

// === 8. LEAVE EVENT ===
export const leaveEvent = async (req, res) => {
  try {
    const eventId = req.params.id || req.body.eventId;
    const userId = req.user._id;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (!event.participants.includes(userId)) {
      return res.status(400).json({ message: "You are not registered for this event." });
    }

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

// === 9. DELETE EVENT ===
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findOne({ _id: id, collegeId: req.user._id });

    if (!event) {
      return res.status(404).json({ message: "Event not found or unauthorized to delete." });
    }

    await Event.findByIdAndDelete(id);
    res.status(200).json({ message: "Event deleted successfully." });
  } catch (error) {
    console.log("Error in deleteEvent:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// === 10. CERTIFICATE DATA ===
export const getCertificateData = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    // Check participation
    if (!event.participants.includes(userId)) {
      return res.status(403).json({ message: "You did not register for this event." });
    }

    // Check verification status
    if (!req.user.isVerifiedDonor) {
        return res.status(403).json({ message: "Your donor status is not verified yet." });
    }

    res.status(200).json({
      eligible: true,
      userName: req.user.fullName,
      eventName: event.title,
      date: event.date
    });

  } catch (error) {
    console.log("Error getCertificateData:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};