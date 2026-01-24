import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

console.log("DEBUG AUTH CHECK:");
console.log("User:", process.env.EMAIL_USER ? "Exists ✅" : "UNDEFINED ❌");
console.log("Pass:", process.env.EMAIL_PASS ? "Exists ✅" : "UNDEFINED ❌");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// === 1. GENERIC EMAIL (Used by Auth Controller) ===
export const sendEmail = async (to, subject, text) => {
    // If text contains "Code:", wrap it in the OTP template
    const isOtp = text.includes("Code:");
    const otpCode = isOtp ? text.split(': ')[1] : "";

    const htmlContent = isOtp ? `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #b30000; text-align: center;">BloodLink Verification</h2>
        <p style="font-size: 16px; color: #333;">Hello,</p>
        <p style="font-size: 16px; color: #333;">Your verification code is:</p>
        <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; color: #b30000; letter-spacing: 5px;">${otpCode}</span>
        </div>
        <p style="font-size: 14px; color: #666;">This code will expire in 10 minutes.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #999; text-align: center;">Thank you for saving lives.<br>The BloodLink Team</p>
      </div>
    ` : `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <p>${text}</p>
      </div>
    `;

    const mailOptions = {
        from: `"BloodLink" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text, // Plain text fallback
        html: htmlContent
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${to}`);
    } catch (error) {
        console.error(`Error sending email to ${to}:`, error);
    }
};

// === 2. OTP EMAIL (Legacy/Specific Use) ===
export const sendEmailOtp = async (email, otp) => {
  // Just reuse the generic one which has the template now
  await sendEmail(email, "Your Verification Code", `Code: ${otp}`);
};

// === 3. EMERGENCY BROADCAST EMAIL (For Hospital Requests) ===
export const sendEmergencyEmail = async (donorEmail, donorName, hospitalName, bloodGroup, units, address, contact) => {
  
  // Create a clean Google Maps Link
  const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  const mailOptions = {
    from: `"BloodLink Emergency" <${process.env.EMAIL_USER}>`,
    to: donorEmail,
    subject: `🚨 URGENT: ${bloodGroup} Blood Needed Nearby!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
        
        <div style="background-color: #b30000; padding: 20px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 24px;">URGENT BLOOD REQUEST</h1>
          <p style="margin: 5px 0 0 0; font-size: 14px;">A life depends on your help.</p>
        </div>

        <div style="padding: 30px; background-color: #fff5f5;">
          <p style="font-size: 16px; color: #333;">Hello <strong>${donorName}</strong>,</p>
          
          <p style="font-size: 16px; color: #333; line-height: 1.5;">
            <strong>${hospitalName}</strong> is currently facing a critical shortage and requires your help immediately. You were identified as a nearby donor with a compatible blood group.
          </p>

          <div style="background-color: white; border-left: 5px solid #b30000; padding: 15px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>🩸 Blood Group:</strong> <span style="color: #b30000; font-weight: bold; font-size: 18px;">${bloodGroup}</span></p>
            <p style="margin: 5px 0;"><strong>💉 Units Needed:</strong> ${units} Units</p>
            <p style="margin: 5px 0;"><strong>🏥 Hospital:</strong> ${hospitalName}</p>
            <p style="margin: 5px 0;"><strong>📍 Location:</strong> ${address}</p>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${mapLink}" style="background-color: #b30000; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Get Directions</a>
            <br/><br/>
            <a href="tel:${contact}" style="color: #b30000; text-decoration: none; font-weight: bold;">📞 Call Hospital: ${contact}</a>
          </div>
        </div>

        <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          <p>You received this email because you are a registered donor on BloodLink within 10km of this emergency.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Emergency email sent to ${donorEmail} ✅`);
  } catch (error) {
    console.error(`Failed to send email to ${donorEmail} ❌:`, error);
  }
};