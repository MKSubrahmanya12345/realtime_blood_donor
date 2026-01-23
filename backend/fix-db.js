import mongoose from "mongoose";
import User from "./src/models/user.model.js"; 

const fixIndexes = async () => {
  try {
    // 👇 KEEP YOUR CONNECTION STRING HERE
    const dbUrl = "mongodb+srv://mksubbu007_db_user:trial1@cluster0.xnhvyum.mongodb.net/user_db?appName=Cluster0";
    
    console.log("Connecting to DB...");
    await mongoose.connect(dbUrl);
    
    console.log("Connected! cleaning up ALL invalid data...");

    // === STEP 1: DELETE BROKEN RECORDS ===
    // This deletes users if:
    // 1. Location is just a text string (Old format)
    // 2. Location exists but coordinates are missing (The "Vaishnavi" error)
    // 3. Location coordinates array is empty
    const deleteResult = await User.deleteMany({
      $or: [
        { location: { $type: "string" } },            // Case 1: "Mangalore"
        { "location.coordinates": { $exists: false } }, // Case 2: Missing coordinates
        { "location.coordinates": { $size: 0 } }        // Case 3: Empty coordinates []
      ]
    });
    
    console.log(`🗑️ Deleted ${deleteResult.deletedCount} users with corrupt location data.`);

    // === STEP 2: CREATE THE INDEX ===
    console.log("Building Geospatial Index...");
    // We use .createIndex() on the raw collection to force it immediately
    await User.collection.createIndex({ location: "2dsphere" });
    
    console.log("✅ FIXED: 2dsphere index created successfully!");
    process.exit();
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

fixIndexes();