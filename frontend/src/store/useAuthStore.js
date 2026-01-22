import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { toast } from "react-hot-toast";

export const useAuthStore = create((set) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isCheckingAuth: true,
    isVerifying: false, // New state for OTP loading

    checkAuth: async()=> {
        try{
            const res = await axiosInstance.get("/auth/check");
            set({authUser: res.data})
        } catch(error){
            set({authUser:null})
            console.log("Error in checkAuth:", error);
        } finally {
            set({isCheckingAuth: false})
        }
    },

    // Modified: Does NOT set authUser yet. Just returns success status.
    signup: async (data) => {
        set({ isSigningUp: true });
        try {
            const res = await axiosInstance.post("/auth/signup", data);
            toast.success("Account created! Check console for OTPs.");
            return res.data; // Return user info (email) to the component
        } catch (error) {
            toast.error(error.response?.data?.message || "Signup failed");
            return null;
        } finally {
            set({ isSigningUp: false });
        }
    },

    // New Action: Verifies OTP
    verifyOtp: async (email, otp, type) => {
        set({ isVerifying: true });
        try {
            const res = await axiosInstance.post("/auth/verify-otp", { email, otp, type });
            
            if (res.data.isFullyVerified) {
                set({ authUser: res.data.user }); // Login the user!
                toast.success("Verification Complete! Welcome.");
                return "SUCCESS";
            } else {
                toast.success(`${type === 'email' ? 'Email' : 'Phone'} verified!`);
                return "PARTIAL";
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Verification failed");
            return "FAILED";
        } finally {
            set({ isVerifying: false });
        }
    },

    login: async (data) => {
        set({ isLoggingIn: true });
        try {
            const res = await axiosInstance.post("/auth/login", data);
            set({ authUser: res.data });
            toast.success("Welcome back!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Login failed");
        } finally {
            set({ isLoggingIn: false });
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post("/auth/logout");
            set({ authUser: null });
            toast.success("Logged out successfully");
        } catch (error) {
            toast.error(error.response?.data?.message || "Logout failed");
        }
    }
}));