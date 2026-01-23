import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 Days
    httpOnly: true, // Prevent XSS attacks
    
    // === FORCE THESE SETTINGS FOR RENDER ===
    sameSite: "none",  // Allow Cross-Site Cookie
    secure: true,      // Required for SameSite="none"
  });

  return token;
};