import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { toast } from "react-hot-toast";
import { io } from "socket.io-client"; // Import Socket Client

// === CRITICAL FIX: Define Backend URL for Socket ===
const BASE_URL = import.meta.env.MODE === "development" 
  ? "http://localhost:3000" 
  : "https://bloodlink-4edh.onrender.com"; // Your Render Backend URL

export const useAuthStore = create((set, get) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isCheckingAuth: true,
    isVerifying: false, // For OTP loading
    
    // Socket State
    socket: null,
    onlineUsers: [],

    // === 1. CHECK AUTH (On Page Load) ===
    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/auth/check");
            set({ authUser: res.data });
            
            // Connect socket if user is authenticated
            get().connectSocket();

            // If the backend sends a fresh token, update it
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

    // === 2. SIGNUP (Step 1 - Donors / Users) ===
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
                
                // Connect socket after successful verification
                get().connectSocket();

                return "SUCCESS";
            } else {
                toast.success(`${type === "email" ? "Email" : "Phone"} verified!`);
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

            // Save Token to LocalStorage
            if (res.data.token) {
                localStorage.setItem("jwt", res.data.token);
            }

            set({ authUser: res.data });
            toast.success("Welcome back!");

            // Connect Socket
            get().connectSocket(); 

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
        } catch (error) {
            console.log("Backend logout error (ignoring):", error);
        } finally {
            // ALWAYS clear these
            localStorage.removeItem("jwt");
            set({ authUser: null });
            get().disconnectSocket(); // Disconnect socket
            toast.success("Logged out successfully");
        }
    },

    // === 6. SOCKET CONNECTION (The Fix) ===
    connectSocket: () => {
        const { authUser, socket } = get();
        
        // If not logged in or already connected, skip
        if (!authUser || (socket && socket.connected)) return;

        // Connect explicitly to the Backend URL
        const newSocket = io(BASE_URL, {
            query: {
                userId: authUser._id,
            },
        });

        newSocket.connect();
        set({ socket: newSocket });

        // Listen for online users update
        newSocket.on("getOnlineUsers", (userIds) => {
            set({ onlineUsers: userIds });
        });
    },

    disconnectSocket: () => {
        const { socket } = get();
        if (socket?.connected) socket.disconnect();
        set({ socket: null });
    },

    // === 7. TOGGLE AVAILABILITY ===
    toggleAvailability: async () => {
        try {
            const { authUser } = get();
            if (!authUser) return;

            // Optimistic UI Update
            const newStatus = !authUser.isAvailable;
            set({ authUser: { ...authUser, isAvailable: newStatus } });

            // Send to Backend (Route corrected to toggle-availability if that's what backend uses)
            const res = await axiosInstance.put("/auth/toggle-availability"); 

            // Sync with Server Response
            set({ authUser: res.data.user || { ...authUser, isAvailable: res.data.isAvailable } });

            toast.success(newStatus ? "You are now Active!" : "You are now Unavailable");

        } catch (error) {
            console.error("Toggle error:", error);
            toast.error("Failed to update status");

            // Revert on error
            const { authUser } = get();
            if (authUser) {
                set({ authUser: { ...authUser, isAvailable: !authUser.isAvailable } });
            }
        }
    },

    // === 8. UPDATE LOCATION (Helper) ===
    updateLocation: async (lat, lng) => {
        try {
            const res = await axiosInstance.put("/auth/profile", {
                location: {
                    type: "Point",
                    coordinates: [lng, lat] // MongoDB expects [lng, lat]
                }
            });
            set({ authUser: res.data });
            toast.success("Location Updated!");
        } catch (error) {
            console.log("Loc update err:", error);
            toast.error("Failed to update location");
        }
    },

    // === 9. REGISTER COLLEGE ===
    registerCollege: async (data) => {
        set({ isSigningUp: true });
        try {
            const res = await axiosInstance.post("/college/register", data);

            if (res.data.token) {
                localStorage.setItem("jwt", res.data.token);
            }

            set({ authUser: res.data });
            toast.success("College Partner Registered!");
            
            get().connectSocket(); // Connect socket for college too

            return res.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Registration failed");
            return null;
        } finally {
            set({ isSigningUp: false });
        }
    }
}));