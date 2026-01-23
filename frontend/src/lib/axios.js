import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "development" 
    ? "http://localhost:3000/api" 
    : "https://bloodlink-4edh.onrender.com/api", // <--- PASTE RENDER URL HERE
  withCredentials: true,
});

