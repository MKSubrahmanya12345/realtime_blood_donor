import axios from "axios";

export const axiosInstance = axios.create({
  // If we are in production, use the live URL. If dev, use localhost.
  baseURL: import.meta.env.MODE === "development" 
    ? "http://localhost:3000/api" 
    : "/api", // We will use a proxy on Vercel (cleaner) OR put your full Render URL here
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("jwt"); // Retrieve token
    if (token) {
        config.headers.Authorization = `Bearer ${token}`; // Attach to header
    }
    return config;
});