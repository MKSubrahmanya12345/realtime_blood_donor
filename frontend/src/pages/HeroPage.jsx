import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { Heart, Activity, Users, MapPin, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import 'leaflet/dist/leaflet.css'; // Ensure Leaflet CSS is loaded
import { useSocketStore } from '../store/useSocketStore';

const HeroPage = () => {
  const navigate = useNavigate();
  const { socket } = useSocketStore();
  const [tickerMsg, setTickerMsg] = useState("🔴 LIVE: A+ Blood needed in Mangaluru • 2 mins ago");
  const [stats, setStats] = useState({ requests: 0, donors: 0, saved: 0 });

  // 1. ANIMATED COUNTERS (Simulated for "Hero" effect)
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        requests: prev.requests < 12 ? prev.requests + 1 : 12,
        donors: prev.donors < 1402 ? prev.donors + 10 : 1402,
        saved: prev.saved < 350 ? prev.saved + 2 : 350
      }));
    }, 30);
    return () => clearInterval(interval);
  }, []);

  // 2. LIVE TICKER (Listen to Socket)
  useEffect(() => {
    if (socket) {
      socket.on("emergencyRequest", (data) => {
        setTickerMsg(`🚨 URGENT: ${data.bloodGroup} needed at ${data.hospitalName}!`);
      });
    }
    return () => socket?.off("emergencyRequest");
  }, [socket]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans selection:bg-red-500 selection:text-white">
      
      {/* === TOP BAR: LIVE TICKER === */}
      <div className="bg-red-600 text-white text-xs font-bold py-2 overflow-hidden flex items-center justify-center">
        <div className="animate-pulse flex items-center gap-2">
          <Activity size={14} />
          <span>{tickerMsg}</span>
        </div>
      </div>

      {/* === HERO SECTION === */}
      <div className="relative w-full h-[600px] overflow-hidden flex items-center justify-center bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        
        {/* Background Map Visualization (Visual Only) */}
        <div className="absolute inset-0 opacity-20 pointer-events-none grayscale">
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

          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight">
            Saving Lives, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
              One Notification at a Time.
            </span>
          </h1>

          <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto">
            Connect directly with donors nearby. No middlemen. No delays. 
            Just instant, location-based alerts when it matters most.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <button 
              onClick={() => navigate('/signup')} 
              className="group bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center gap-2 shadow-lg shadow-red-600/20"
            >
              <Heart className="group-hover:scale-110 transition-transform" />
              Become a Donor
            </button>
            <button 
              onClick={() => navigate('/request')} 
              className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center gap-2"
            >
              <Activity />
              Request Blood
            </button>
          </div>

          {/* IMPACT METRICS */}
          <div className="grid grid-cols-3 gap-8 mt-16 border-t border-slate-800 pt-8">
            <div>
              <div className="text-4xl font-black text-white">{stats.requests}</div>
              <div className="text-sm text-slate-500 uppercase tracking-wider font-semibold">Live Requests</div>
            </div>
            <div>
              <div className="text-4xl font-black text-white">{stats.donors}+</div>
              <div className="text-sm text-slate-500 uppercase tracking-wider font-semibold">Active Donors</div>
            </div>
            <div>
              <div className="text-4xl font-black text-white">{stats.saved}</div>
              <div className="text-sm text-slate-500 uppercase tracking-wider font-semibold">Lives Impacted</div>
            </div>
          </div>
        </div>
      </div>

      {/* === ACTION GRID & ELIGIBILITY WIDGET === */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: ACTION CARDS */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1 */}
            <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 hover:border-red-500/50 transition-colors group cursor-pointer" onClick={() => navigate('/blood-centers')}>
              <div className="h-12 w-12 bg-red-500/20 rounded-lg flex items-center justify-center text-red-500 mb-6 group-hover:scale-110 transition-transform">
                <MapPin size={24} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Find Blood Centers</h3>
              <p className="text-slate-400 mb-6">Locate nearby blood banks and check real-time inventory availability.</p>
              <span className="text-red-400 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">Search Map <ArrowRight size={16}/></span>
            </div>

            {/* Card 2 */}
            <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 hover:border-blue-500/50 transition-colors group cursor-pointer" onClick={() => navigate('/college/login')}>
              <div className="h-12 w-12 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition-transform">
                <Users size={24} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">College Portal</h3>
              <p className="text-slate-400 mb-6">Organize campus drives and manage student volunteer groups.</p>
              <span className="text-blue-400 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">Partner Login <ArrowRight size={16}/></span>
            </div>
             
             {/* Card 3 (Hospital) */}
            <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 hover:border-green-500/50 transition-colors group cursor-pointer md:col-span-2" onClick={() => navigate('/hospital/login')}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="h-12 w-12 bg-green-500/20 rounded-lg flex items-center justify-center text-green-500 mb-6 group-hover:scale-110 transition-transform">
                    <Activity size={24} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Hospital Dashboard</h3>
                  <p className="text-slate-400">Emergency access for medical professionals to request bulk units.</p>
                </div>
                <div className="hidden md:block">
                   <button className="bg-slate-700 text-white px-6 py-3 rounded-lg hover:bg-slate-600 transition">Login</button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: ELIGIBILITY WIDGET */}
          <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
             {/* Decorative Circles */}
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
             <div className="absolute bottom-10 left-10 w-20 h-20 bg-black/10 rounded-full blur-xl"></div>

             <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
               <CheckCircle className="text-red-200" /> 
               Can I Donate?
             </h3>
             
             <div className="space-y-4">
               <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl">
                 <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">1</div>
                 <span className="font-medium">Are you 18-65 years old?</span>
               </div>
               <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl">
                 <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">2</div>
                 <span className="font-medium">Weight above 50kg?</span>
               </div>
               <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl">
                 <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">3</div>
                 <span className="font-medium">No donation in last 3 months?</span>
               </div>
             </div>

             <div className="mt-8">
               <p className="text-red-100 text-sm mb-4">If you ticked all 3, you are a hero in waiting.</p>
               <button 
                 onClick={() => navigate('/signup')}
                 className="w-full bg-white text-red-700 font-bold py-3 rounded-xl hover:bg-red-50 transition shadow-lg"
               >
                 Register Now
               </button>
             </div>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-slate-500 py-12 text-center text-sm border-t border-slate-900">
        <p>© 2026 BloodLink Network. Built for the SIH Hackathon.</p>
      </footer>
    </div>
  );
};

export default HeroPage;