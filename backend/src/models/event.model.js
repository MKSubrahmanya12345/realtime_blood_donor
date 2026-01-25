import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    // Basic Event Info
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    numberOfDays: {
      type: Number,
      default: 1,
      min: 1,
    },

    location: {
      type: String,
      required: true,
    },

    // Organizer Details
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: true,
    },

    organizerName: {
      type: String,
      required: true,
    },

    contactNumber: {
      type: String,
      required: true,
    },

    // Students who registered
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Event Status
    status: {
      type: String,
      enum: ["Upcoming", "Active", "Completed"],
      default: "Upcoming",
    },
  },
  {
    timestamps: true,
  }
);

const Event = mongoose.model("Event", eventSchema);

export default Event;
