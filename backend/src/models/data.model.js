import mongoose from "mongoose";

const donationDataSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        donationDate: {
            type: Date
        },
        bloodGroupNeeded: {
            type: String,
            enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        location: {
            type: String,
            required: true
        },
        urgency: {
            type: String,
            enum: ["low", "medium", "high", "critical"],
            default: "medium"
        },
        status: {
            type: String,
            enum: ["pending", "in_progress", "completed", "cancelled"],
            default: "pending"
        },
        reason: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

const DonationData = mongoose.model("DonationData", donationDataSchema);

export default DonationData;
