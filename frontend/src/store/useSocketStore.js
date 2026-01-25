import { create } from "zustand";
import { io } from "socket.io-client";
import { useAuthStore } from "./useAuthStore";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:3000" : "https://bloodlink-4edh.onrender.com";

export const useSocketStore = create((set, get) => ({
  socket: null,
  onlineUsers: [],

  connectSocket: () => {
    const { authUser } = useAuthStore.getState();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });

    socket.connect();
    set({ socket: socket });

    // Listen for connection errors
    socket.on("connect_error", (err) => {
        console.log("Socket connection failed", err);
    });
  },

  disconnectSocket: () => {
    if (get().socket?.connected) {
        get().socket.disconnect();
        set({ socket: null });
    }
  },
}));