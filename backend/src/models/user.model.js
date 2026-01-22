import mongoose  from "mongoose";

const userSchema = new mongoose.Schema(
    {
        role:{
            type: String,
            default: "pending"
        },
        fullName:{
            type: String,
            required: true
        },
        email:{
            type: String,
            required: true,
            unique: true
        },
        password:{
            type: String,
            required: true,
            minlength:6
        },
        phone: {
            type: String
        },
        location: {
            type: String 
        },
        bloodGroup: {
            type: String,
            enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
        },
        lastDonationDate: {
            type: Date,
        },
        isAvailable: {
            type: Boolean,
            default: true
        },
        collegeId: {
            type: String, // Roll Number
        },
        collegeName: {
            type: String,
        },
        hospitalLicense: {
            type: String,
        },
        isProfileComplete: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }

);

const User = mongoose.model("User", userSchema);

export default User;
