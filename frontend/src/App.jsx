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

import CollegeRegistrationPage from './pages/CollegeRegistrationPage';
import CollegeLoginPage from './pages/CollegeLoginPage';
import CollegeDashboard from './pages/CollegeDashboard';

// === HOSPITAL IMPORTS ===
import HospitalOnboardingPage from './pages/HospitalOnboardingPage';
import HospitalDashboard from './pages/HospitalDashboard';

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

        {/* --- 🚦 ROLE-AWARE HOME ROUTE --- */}
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
              <HomePage /> // Default: Donor Dashboard
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

        {/* 1. REGISTRATION: Only for Guests */}
        <Route
          path="/hospital/register"
          element={
            !authUser ? (
              <HospitalOnboardingPage />
            ) : (
              <Navigate to="/hospital" />
            )
          }
        />

        {/* 2. LOGIN: Only for Guests */}
        <Route
          path="/hospital/login"
          element={
            !authUser ? (
              <HospitalLoginPage />
            ) : authUser.role === "hospital" ? (
              <Navigate to="/hospital" />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* 3. DASHBOARD: Only for Logged-in Hospitals */}
        <Route
          path="/hospital"
          element={
            authUser?.role === "hospital" ? (
              <HospitalDashboard />
            ) : (
              <Navigate to="/hospital/login" />
            )
          }
        />

        {/* --- COLLEGE PARTNER ROUTES --- */}

        <Route
          path="/college/register"
          element={
            !authUser ? (
              <CollegeRegistrationPage />
            ) : (
              <Navigate to="/college" />
            )
          }
        />

        <Route
          path="/college/login"
          element={
            !authUser ? (
              <CollegeLoginPage />
            ) : (
              <Navigate to="/college" />
            )
          }
        />

        <Route
          path="/college"
          element={
            authUser?.role === "college" ? (
              <CollegeDashboard />
            ) : (
              <Navigate to="/college/login" />
            )
          }
        />

      </Routes>
    </div>
  );
};

export default App;
