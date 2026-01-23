import mongoose from "mongoose";

const hospitalSchema = new mongoose.Schema(
  {
    // SQL: name TEXT PRIMARY KEY
    hospitalName: { 
      type: String, 
      required: true, 
      unique: true 
    },

    // SQL: email TEXT NOT NULL UNIQUE
    email: { 
      type: String, 
      required: true, 
      unique: true 
    },

    // SQL: licenseNumber TEXT NOT NULL UNIQUE
    licenseNumber: { 
      type: String, 
      required: true, 
      unique: true 
    },

    // SQL: contactNumber TEXT NOT NULL
    contactNumber: { 
      type: String, 
      required: true 
    },

    // SQL: location TEXT NOT NULL (Human address)
    address: { 
      type: String, 
      required: true 
    },

    // SQL: latitude REAL, longitude REAL
    // We convert this to GeoJSON for the "Find Nearby" feature
    location: {
      type: { type: String, default: "Point" },
      coordinates: { type: [Number], index: "2dsphere" } // [Longitude, Latitude]
    },

    // SQL: capcity INTEGER NOT NULL
    capacity: { 
      type: Number, 
      required: true 
    },

    // SQL: availableBloodUnits INTEGER NOT NULL
    // I added a detailed breakdown because "Total: 50" isn't enough info for a doctor.
    totalBloodUnits: { 
      type: Number, 
      default: 0 
    },
    inventory: {
      'A+': { type: Number, default: 0 },
      'A-': { type: Number, default: 0 },
      'B+': { type: Number, default: 0 },
      'B-': { type: Number, default: 0 },
      'AB+': { type: Number, default: 0 },
      'AB-': { type: Number, default: 0 },
      'O+': { type: Number, default: 0 },
      'O-': { type: Number, default: 0 },
    },

    // SQL: Emergency Services BOOLEAN DEFAULT 0
    hasEmergencyServices: { 
      type: Boolean, 
      default: false 
    },

    // SQL: Operating Hours TEXT
    operatingHours: { 
      type: String, 
      default: "24/7" 
    },
    
    // Link to the User Login (so they can manage this dashboard)
    adminUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true } // Handles createdAt, updatedAt automatically
);

const Hospital = mongoose.model("Hospital", hospitalSchema);
export default Hospital;