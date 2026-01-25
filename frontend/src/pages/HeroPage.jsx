import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet';
import { Heart, Activity, Users, MapPin, CheckCircle, ArrowRight, Menu } from 'lucide-react';
import 'leaflet/dist/leaflet.css'; 
import { useSocketStore } from '../store/useSocketStore';
import { axiosInstance } from "../lib/axios";

const HeroPage = () => {
  const navigate = useNavigate();
  const { socket } = useSocketStore();
  const [tickerMsg, setTickerMsg] = useState("🔴 LIVE: A+ Blood needed in Mangaluru • 2 mins ago");
  const [stats, setStats] = useState({ requests: 0, donors: 0, saved: 0 });

  // 1. FETCH REAL STATS
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axiosInstance.get("/request/stats");
        setStats({
          requests: res.data.requests || 0,
          donors: res.data.donors || 0,
          saved: res.data.saved || 0
        });
      } catch (error) {
        console.error("Stats fetch failed (using defaults)");
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  // 2. LIVE TICKER
  useEffect(() => {
    if (socket) {
      socket.on("emergencyRequest", (data) => {
        setTickerMsg(`🚨 URGENT: ${data.bloodGroup} needed at ${data.hospitalName}!`);
      });
    }
    return () => socket?.off("emergencyRequest");
  }, [socket]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-red-500 selection:text-white">
      
      {/* === GLOBAL TICKER (Sticky on Mobile) === */}
      <div className="sticky top-0 z-50 bg-red-600 text-white text-xs md:text-sm font-bold py-3 shadow-lg flex items-center justify-center overflow-hidden">
        <div className="animate-pulse flex items-center gap-2 px-4 text-center">
          <Activity size={16} className="shrink-0" />
          <span className="truncate">{tickerMsg}</span>
        </div>
      </div>

      {/* =======================================================
          MOBILE HERO (Visible only on small screens)
          - No heavy Map
          - Vertical Layout
          - Large Touch Targets
      ======================================================== */}
      <div className="md:hidden flex flex-col items-center justify-center px-6 py-12 bg-gradient-to-b from-slate-900 via-slate-900 to-red-950/30">
        
        {/* Mobile Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          Live Network
        </div>

        <h1 className="text-4xl font-black text-white text-center mb-4 leading-tight">
          Save a Life <br />
          <span className="text-red-500">Right Now.</span>
        </h1>

        <p className="text-slate-400 text-center text-sm mb-8 leading-relaxed">
          Nearby blood requests send instant alerts to your phone. No middlemen. Just you and the patient.
        </p>

        {/* Mobile Actions (Stacked) */}
        <div className="w-full space-y-3 mb-10">
          <button 
            onClick={() => navigate('/signup')} 
            className="w-full bg-red-600 active:bg-red-700 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-red-900/20"
          >
            <Heart size={20} fill="currentColor" />
            Become a Donor
          </button>
          
          <button 
            onClick={() => navigate('/request')} 
            className="w-full bg-slate-800 active:bg-slate-700 text-white border border-slate-700 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2"
          >
            <Activity size={20} />
            Request Blood
          </button>
        </div>

        {/* Mobile Stats (Horizontal Scroll or Grid) */}
        <div className="w-full grid grid-cols-3 gap-2 border-t border-slate-800 pt-6 text-center">
          <div>
            <div className="text-2xl font-bold text-white">{stats.requests}</div>
            <div className="text-[10px] text-slate-500 uppercase">Requests</div>
          </div>
          <div className="border-l border-slate-800">
            <div className="text-2xl font-bold text-white">{stats.donors}</div>
            <div className="text-[10px] text-slate-500 uppercase">Donors</div>
          </div>
          <div className="border-l border-slate-800">
            <div className="text-2xl font-bold text-white">{stats.saved}</div>
            <div className="text-[10px] text-slate-500 uppercase">Saved</div>
          </div>
        </div>
      </div>

      {/* =======================================================
          DESKTOP HERO (Visible only on medium+ screens)
          - Interactive Map Background
          - Cinematic Layout
      ======================================================== */}
      <div className="hidden md:flex relative w-full h-[650px] overflow-hidden items-center justify-center bg-slate-900">
        
        {/* Map Background (Desktop Only) */}
        <div className="absolute inset-0 opacity-30 pointer-events-none grayscale hover:grayscale-0 transition-all duration-1000">
          <MapContainer center={[12.9141, 74.8560]} zoom={13} zoomControl={false} scrollWheelZoom={false} className="h-full w-full">
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
            <CircleMarker center={[12.9141, 74.8560]} radius={20} pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.5 }} />
            <CircleMarker center={[12.9241, 74.8660]} radius={10} pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.5 }} />
          </MapContainer>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            Real-Time Blood Donation Network
          </div>

          <h1 className="text-7xl font-extrabold text-white mb-6 tracking-tight drop-shadow-2xl">
            Saving Lives, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
              One Notification at a Time.
            </span>
          </h1>

          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto drop-shadow-md">
            Connect directly with donors nearby. No middlemen. No delays. 
            Just instant, location-based alerts when it matters most.
          </p>

          <div className="flex justify-center gap-4">
            <button 
              onClick={() => navigate('/signup')} 
              className="group bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center gap-2 shadow-lg shadow-red-600/20 hover:scale-105"
            >
              <Heart className="group-hover:scale-110 transition-transform" fill="currentColor" />
              Become a Donor
            </button>
            <button 
              onClick={() => navigate('/request')} 
              className="bg-slate-800/80 backdrop-blur-sm hover:bg-slate-700 text-white border border-slate-600 px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center gap-2 hover:scale-105"
            >
              <Activity />
              Request Blood
            </button>
          </div>

          {/* Desktop Stats */}
          <div className="grid grid-cols-3 gap-12 mt-16 border-t border-slate-700/50 pt-8 max-w-3xl mx-auto">
            <div>
              <div className="text-5xl font-black text-white">{stats.requests}</div>
              <div className="text-sm text-slate-400 uppercase tracking-wider font-semibold mt-1">Live Requests</div>
            </div>
            <div>
              <div className="text-5xl font-black text-white">{stats.donors}</div>
              <div className="text-sm text-slate-400 uppercase tracking-wider font-semibold mt-1">Active Donors</div>
            </div>
            <div>
              <div className="text-5xl font-black text-white">{stats.saved}</div>
              <div className="text-sm text-slate-400 uppercase tracking-wider font-semibold mt-1">Lives Impacted</div>
            </div>
          </div>
        </div>
      </div>

      {/* === ACTION GRID & WIDGET (Responsive) === */}
      <section className="py-12 md:py-20 px-4 md:px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          
          {/* Action Cards */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="bg-slate-800/50 p-6 md:p-8 rounded-2xl border border-slate-700 hover:border-red-500/50 transition-colors group cursor-pointer" onClick={() => navigate('/blood-centers')}>
              <div className="h-10 w-10 md:h-12 md:w-12 bg-red-500/20 rounded-lg flex items-center justify-center text-red-500 mb-4 md:mb-6">
                <MapPin size={24} />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-2">Find Blood Centers</h3>
              <p className="text-sm md:text-base text-slate-400 mb-4 md:mb-6">Locate nearby blood banks and check real-time inventory.</p>
              <span className="text-red-400 font-medium flex items-center gap-2 text-sm">Search Map <ArrowRight size={16}/></span>
            </div>

            <div className="bg-slate-800/50 p-6 md:p-8 rounded-2xl border border-slate-700 hover:border-blue-500/50 transition-colors group cursor-pointer" onClick={() => navigate('/college/login')}>
              <div className="h-10 w-10 md:h-12 md:w-12 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-500 mb-4 md:mb-6">
                <Users size={24} />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-2">College Portal</h3>
              <p className="text-sm md:text-base text-slate-400 mb-4 md:mb-6">Organize campus drives and manage student volunteers.</p>
              <span className="text-blue-400 font-medium flex items-center gap-2 text-sm">Partner Login <ArrowRight size={16}/></span>
            </div>
             
             {/* Hospital Card */}
            <div className="bg-slate-800/50 p-6 md:p-8 rounded-2xl border border-slate-700 hover:border-green-500/50 transition-colors group cursor-pointer md:col-span-2" onClick={() => navigate('/hospital/login')}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="h-10 w-10 md:h-12 md:w-12 bg-green-500/20 rounded-lg flex items-center justify-center text-green-500 mb-4">
                    <Activity size={24} />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-2">Hospital Dashboard</h3>
                  <p className="text-sm md:text-base text-slate-400">Emergency access for medical professionals to request bulk units.</p>
                </div>
                <button className="w-full md:w-auto bg-slate-700 text-white px-6 py-3 rounded-lg hover:bg-slate-600 transition font-semibold">Login</button>
              </div>
            </div>
          </div>

          {/* Eligibility Widget */}
          <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
             
             <h3 className="text-xl md:text-2xl font-bold mb-6 flex items-center gap-2">
               <CheckCircle className="text-red-200" /> 
               Can I Donate?
             </h3>
             
             <div className="space-y-3 md:space-y-4">
               <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                 <div className="h-6 w-6 md:h-8 md:w-8 rounded-full bg-white/20 flex items-center justify-center text-xs md:text-sm font-bold">1</div>
                 <span className="text-sm md:text-base font-medium">18-65 years old?</span>
               </div>
               <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                 <div className="h-6 w-6 md:h-8 md:w-8 rounded-full bg-white/20 flex items-center justify-center text-xs md:text-sm font-bold">2</div>
                 <span className="text-sm md:text-base font-medium">Weight &gt; 50kg?</span>
               </div>
               <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                 <div className="h-6 w-6 md:h-8 md:w-8 rounded-full bg-white/20 flex items-center justify-center text-xs md:text-sm font-bold">3</div>
                 <span className="text-sm md:text-base font-medium">No donation in 3 months?</span>
               </div>
             </div>

             <div className="mt-8">
               <button 
                 onClick={() => navigate('/signup')}
                 className="w-full bg-white text-red-700 font-bold py-3 rounded-xl hover:bg-red-50 transition shadow-lg text-sm md:text-base"
               >
                 Register Now
               </button>
             </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-500 py-8 md:py-12 text-center text-xs md:text-sm border-t border-slate-900">
        <p>© 2026 BloodLink Network. Built for the SIH Hackathon.</p>
      </footer>
    </div>
  );
};

export default HeroPage;