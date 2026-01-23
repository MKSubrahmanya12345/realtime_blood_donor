import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Check your .env file
    pass: process.env.EMAIL_PASS, // Check your .env file (App Password)
  },
});

// === 1. OTP EMAIL (For Login) ===
export const sendEmailOtp = async (email, otp) => {
  const mailOptions = {
    from: `"BloodLink" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your Verification Code",
    text: `Your verification code is: ${otp}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #b30000;">BloodLink Verification</h2>
        <p>Your One-Time Password (OTP) for login is:</p>
        <h1 style="font-size: 32px; letter-spacing: 2px;">${otp}</h1>
        <p>This code expires in 10 minutes.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent successfully to ${email}`);
  } catch (error) {
    console.error(`Error sending OTP to ${email}:`, error);
  }
};

// === 2. EMERGENCY BROADCAST EMAIL (For Hospital Requests) ===
export const sendEmergencyEmail = async (donorEmail, donorName, hospitalName, bloodGroup, units, address, contact) => {
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
            <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}" style="background-color: #b30000; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Get Directions</a>
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
    console.log(`Emergency email sent to ${donorEmail}`);
  } catch (error) {
    console.error(`Failed to send email to ${donorEmail}:`, error);
  }
};