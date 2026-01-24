import mongoose from "mongoose"; // Don't forget to import this!

export const signup = async (req, res) => {
  const { fullName, email, password, role, collegeId, ...otherData } = req.body;
  try {
    // 1. Check Password
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // 2. Check Duplicate Email
    const user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "Email already exists" });

    // 3. Validate College Name (if signing up as a College)
    if (role === "college") {
        const existingCollege = await User.findOne({ fullName: fullName }); // Check existing names
        if (existingCollege) {
            return res.status(400).json({ message: "A college with this name is already registered." });
        }
    }

    // 4. SAFER COLLEGE ID HANDLING (Fixes the 500 Crash)
    let safeCollegeId = undefined;
    
    // Only try to save collegeId if it's a valid MongoDB ID
    if ((role === 'student' || role === 'donor') && collegeId) {
        if (mongoose.Types.ObjectId.isValid(collegeId)) {
            safeCollegeId = collegeId;
        } else {
            console.log(`[Warning] Ignored invalid College ID: ${collegeId}`);
            // We ignore the bad ID instead of crashing
        }
    }

    // 5. Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      role,
      collegeId: safeCollegeId, // Use the safe version
      ...otherData,
    });

    await newUser.save();

    // 6. Generate Token & Reply
    generateToken(newUser._id, res);
    res.status(201).json({
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      role: newUser.role,
      collegeId: newUser.collegeId
    });

  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};