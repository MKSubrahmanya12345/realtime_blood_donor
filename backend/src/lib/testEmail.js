import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendTest() {
  try {
    const info = await transporter.sendMail({
      from: `"BloodLink Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // send to self for testing
      subject: "✅ Test Email",
      text: "Hello! This is a Nodemailer test.",
    });
    console.log("Email sent:", info.response);
  } catch (err) {
    console.error("Error sending test email:", err);
  }
}

sendTest();
