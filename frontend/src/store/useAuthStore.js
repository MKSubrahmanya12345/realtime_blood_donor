import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { toast } from "react-hot-toast";

export const useAuthStore = create((set, get) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isCheckingAuth: true,
    isVerifying: false, // For OTP loading

    // === 1. CHECK AUTH (On Page Load) ===
    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/auth/check");
            set({ authUser: res.data });
            
            // If the backend sends a fresh token/location, update it
            if (res.data.token) {
                localStorage.setItem("jwt", res.data.token);
            }
        } catch (error) {
            set({ authUser: null });
            console.log("Error in checkAuth:", error);
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    // === 2. SIGNUP (Step 1) ===
    signup: async (data) => {
        set({ isSigningUp: true });
        try {
            const res = await axiosInstance.post("/auth/signup", data);
            toast.success("Account created! Check email for OTP.");
            return res.data; 
        } catch (error) {
            toast.error(error.response?.data?.message || "Signup failed");
            return null;
        } finally {
            set({ isSigningUp: false });
        }
    },

    // === 3. VERIFY OTP (Step 2) ===
    verifyOtp: async (email, otp, type) => {
        set({ isVerifying: true });
        try {
            const res = await axiosInstance.post("/auth/verify-otp", { email, otp, type });
            
            if (res.data.isFullyVerified) {
                // SAVE TOKEN IF PROVIDED
                if (res.data.token) {
                    localStorage.setItem("jwt", res.data.token);
                }

                set({ authUser: res.data.user });
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

    // === 4. LOGIN ===
    login: async (data) => {
        set({ isLoggingIn: true });
        try {
            const res = await axiosInstance.post("/auth/login", data);
            
            // CRITICAL FIX: Save Token to LocalStorage
            if (res.data.token) {
                localStorage.setItem("jwt", res.data.token);
            }

            set({ authUser: res.data });
            toast.success("Welcome back!");
            
            // Connect Socket (if you have it implemented)
            // get().connectSocket(); 

            return res.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Login failed");
        } finally {
            set({ isLoggingIn: false });
        }
    },

    // === 5. LOGOUT ===
    logout: async () => {
        try {
            await axiosInstance.post("/auth/logout");
            
            // CRITICAL FIX: Remove Token
            localStorage.removeItem("jwt");
            
            set({ authUser: null });
            toast.success("Logged out successfully");
            
            // Disconnect Socket
            // get().disconnectSocket();

        } catch (error) {
            toast.error(error.response?.data?.message || "Logout failed");
        }
    },

    // === 6. TOGGLE AVAILABILITY ===
    toggleAvailability: async () => {
        try {
            const { authUser } = get();
            if (!authUser) return;

            // Optimistic UI Update (Instant toggle)
            const newStatus = !authUser.isAvailable;
            set({ authUser: { ...authUser, isAvailable: newStatus } });

            // Send to Backend
            const res = await axiosInstance.put("/auth/update-profile", {
                isAvailable: newStatus
            });

            // Sync with Server Response
            set({ authUser: res.data.user });
            
            toast.success(newStatus ? "You are now Active!" : "You are now Unavailable");

        } catch (error) {
            console.error("Toggle error:", error);
            toast.error("Failed to update status");
            // Revert on error
            const { authUser } = get();
            if(authUser) set({ authUser: { ...authUser, isAvailable: !authUser.isAvailable } });
        }
    },

    // === 7. UPDATE LOCATION (Helper) ===
    updateLocation: async (lat, lng) => {
        try {
             const res = await axiosInstance.put("/auth/update-profile", {
                latitude: lat,
                longitude: lng
            });
            set({ authUser: res.data.user });
            toast.success("Location Updated!");
        } catch (error) {
            toast.error("Failed to update location");
        }
    }
}));