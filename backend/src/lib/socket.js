import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    // === CRITICAL FIX: Allow Vercel Frontend ===
    origin: [
        "http://localhost:5173",
        "https://bloodlink-pi.vercel.app" 
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], 
    credentials: true
  },
});

// Map to store {userId: socketId}
const userSocketMap = {}; 

export const getReceiverSocketId = (userId) => {
  return userSocketMap[userId];
};

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  // Broadcast online users to everyone
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };