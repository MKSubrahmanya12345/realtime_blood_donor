import mongoose from "mongoose";

const collegeSchema = new mongoose.Schema(
  {
    collegeName: { 
      type: String, 
      required: true, 
      unique: true 
    },
    email: { 
      type: String, 
      required: true, 
      unique: true 
    },
    address: { 
      type: String, 
      required: true 
    },
    // GeoJSON for Map placement
    location: {
      type: { type: String, default: "Point" },
      coordinates: { type: [Number], index: "2dsphere" } // [Longitude, Latitude]
    },
    // Link to the User Login (The College Admin)
    adminUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

const College = mongoose.model("College", collegeSchema);
export default College;