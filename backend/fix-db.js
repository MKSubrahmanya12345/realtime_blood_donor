import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/user.model.js"; 

dotenv.config();

const fixIndexes = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB...");

    // Force creation of the GPS index
    await User.collection.createIndex({ location: "2dsphere" });
    
    console.log("✅ FIXED: 2dsphere index created successfully!");
    process.exit();
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

fixIndexes();