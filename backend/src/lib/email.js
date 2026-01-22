import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});

export const sendEmailOtp = async (to, otp) => {
    try {
        const mailOptions = {
            from: `"Blood Link" <${process.env.MAIL_USER}>`,
            to: to,
            subject: "Verify Your Blood Donor Account",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #b30000;">Blood Link Verification</h2>
                    <p>Thank you for registering as a donor! Your verification code is:</p>
                    <h1 style="color: #333; letter-spacing: 5px;">${otp}</h1>
                    <p>This code expires in 10 minutes.</p>
                    <hr>
                    <p style="font-size: 12px; color: #777;">If you didn't request this, please ignore this email.</p>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${to}`);
        return true;
    } catch (error) {
        console.error("Email Error:", error.message);
        return false;
    }
};