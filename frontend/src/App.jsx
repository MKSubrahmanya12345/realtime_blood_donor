import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { useSocketStore } from './store/useSocketStore';
import { Loader } from "lucide-react";
import { Toaster, toast } from 'react-hot-toast';
import "leaflet/dist/leaflet.css";

// Page Imports
import Navbar from './components/Navbar';
import HeroPage from './pages/HeroPage';
import HomePage from './pages/HomePage';
import SignUpPage from './pages/SignUpPage';
import LoginPage from './pages/LoginPage';
import BloodCentersPage from './pages/BloodCentersPage';
import AboutPage from './pages/AboutPage';

// Hospital Pages
import HospitalOnboardingPage from './pages/HospitalOnboardingPage';
import HospitalLoginPage from './pages/HospitalLoginPage';
import HospitalDashboard from './pages/HospitalDashboard';

// College Pages
import CollegeRegistrationPage from './pages/CollegeRegistrationPage';
import CollegeLoginPage from './pages/CollegeLoginPage';
import CollegeDashboard from './pages/CollegeDashboard';

const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const { connectSocket, disconnectSocket, socket } = useSocketStore();

  // 1. Check Authentication on Load
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // 2. Connect/Disconnect Socket based on Auth Status
  useEffect(() => {
    if (authUser) {
      connectSocket();
    } else {
      disconnectSocket();
    }
  }, [authUser, connectSocket, disconnectSocket]);

  // 3. Listen for Emergency Alerts
  useEffect(() => {
    if (!socket) return;

    socket.on("emergencyRequest", (data) => {
      // Play Sound
      const audio = new Audio('/notification.mp3');
      audio.play().catch(() => console.log("Audio file missing, skipping sound."));

      // Show Alert Popup
      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-2xl rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 border-l-4 border-red-600`}>
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center animate-pulse">
                  <span className="text-xl">🚨</span>
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-bold text-gray-900">
                  EMERGENCY ALERT
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {data.message}
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              Close
            </button>
          </div>
        </div>
      ), { duration: 10000 });
    });

    return () => {
      socket.off("emergencyRequest");
    };
  }, [socket]);

  // Loading Screen
  if (isCheckingAuth && !authUser) return (
    <div className="flex items-center justify-center h-screen">
      <Loader className="size-10 animate-spin text-[#b30000]" />
    </div>
  );

  return (
    <div>
      <Navbar />
      
      {/* ✅ CORRECT PLACEMENT: Outside of Routes */}
      <Toaster position="top-center" reverseOrder={false} />

      <Routes>
        {/* --- 🚦 HOME ROUTE (Role-Based Redirect) --- */}
        <Route
          path="/"
          element={
            !authUser ? (
              <HeroPage />
            ) : authUser.role === "hospital" ? (
              <Navigate to="/hospital" />
            ) : authUser.role === "college" ? (
              <Navigate to="/college" />
            ) : (
              <HomePage /> // Donors go here
            )
          }
        />

        {/* --- PUBLIC ROUTES --- */}
        <Route path="/blood-centers" element={<BloodCentersPage />} />
        <Route path="/about" element={<AboutPage />} />

        {/* --- DONOR AUTH --- */}
        <Route
          path="/signup"
          element={!authUser ? <SignUpPage /> : <Navigate to="/" />}
        />
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to="/" />}
        />

        {/* --- HOSPITAL ROUTES --- */}
        <Route
          path="/hospital/register"
          element={!authUser ? <HospitalOnboardingPage /> : <Navigate to="/hospital" />}
        />
        <Route
          path="/hospital/login"
          element={!authUser ? <HospitalLoginPage /> : authUser.role === "hospital" ? <Navigate to="/hospital" /> : <Navigate to="/" />}
        />
        <Route
          path="/hospital"
          element={authUser?.role === "hospital" ? <HospitalDashboard /> : <Navigate to="/hospital/login" />}
        />

        {/* --- COLLEGE ROUTES --- */}
        <Route
          path="/college/register"
          element={!authUser ? <CollegeRegistrationPage /> : <Navigate to="/college" />}
        />
        <Route
          path="/college/login"
          element={!authUser ? <CollegeLoginPage /> : <Navigate to="/college" />}
        />
        <Route
          path="/college"
          element={authUser?.role === "college" ? <CollegeDashboard /> : <Navigate to="/college/login" />}
        />
      </Routes>
    </div>
  );
};

export default App;