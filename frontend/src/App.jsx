import ProfilePage from './pages/ProfilePage';
import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { Loader } from "lucide-react";
import "leaflet/dist/leaflet.css";

import Navbar from './components/Navbar';
import HeroPage from './pages/HeroPage';
import HomePage from './pages/HomePage';
import SignUpPage from './pages/SignUpPage';
import LoginPage from './pages/LoginPage';
import BloodCentersPage from './pages/BloodCentersPage';
import HospitalLoginPage from './pages/HospitalLoginPage'; 
import AboutPage from './pages/AboutPage';

// === NEW IMPORTS ===
import HospitalOnboardingPage from './pages/HospitalOnboardingPage'; // The new One-Shot form
import HospitalDashboard from './pages/HospitalDashboard'; // The Dashboard they go to after

const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  console.log({ authUser });

  if (isCheckingAuth && !authUser) return (
    <div className="flex items-center justify-center h-screen">
      <Loader className="size-10 animate-spin text-[#b30000]" />
    </div>
  );

  return (
    <div>
      <Navbar />

      <Routes>
        {/* --- PUBLIC ROUTES --- */}
        <Route path="/" element={authUser ? <HomePage /> : <HeroPage />} />
        <Route path="/blood-centers" element={<BloodCentersPage />} />
        
        {/* Donor Signup & Login */}
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />

        {/* --- HOSPITAL ROUTES --- */}
        
        {/* 1. REGISTRATION: Only for Guests (Creates Admin + Hospital) */}
        <Route path="/hospital/register" element={
            !authUser ? <HospitalOnboardingPage /> : <Navigate to="/hospital" />
        } />

        {/* 2. DASHBOARD: Only for Logged-in Hospitals */}
        <Route path="/hospital/login" element={
            !authUser ? <HospitalLoginPage /> : (authUser.role === 'hospital' ? <Navigate to="/hospital" /> : <Navigate to="/" />)
        } />

        <Route path="/hospital" element={
            authUser?.role === 'hospital' ? <HospitalDashboard /> : <Navigate to="/hospital/login" />
        } />

        <Route path="/about" element={<AboutPage />} />

      </Routes>
    </div>
  );
};

export default App;