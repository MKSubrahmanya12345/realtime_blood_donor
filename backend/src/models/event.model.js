import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true }, // e.g., "Annual CSE Blood Drive"
  date: { type: Date, required: true },    // e.g., "2025-10-24"
  
  // Who is organizing it?
  collegeId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "College", 
    required: true 
  },
  
  numberOfDays: { type: Number, default: 1 },
  location: { type: String }, // Specific hall/room
  
  // Students who joined/registered for this event
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],

  status: {
    type: String,
    enum: ["Upcoming", "Active", "Completed"], // "Active" = Today
    default: "Upcoming"
  },
  organizerName: { type: String, required: true },
  contactNumber: { type: String, required: true },
  participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
}, 
{ timestamps: true });

const Event = mongoose.model("Event", eventSchema);
export default Event;