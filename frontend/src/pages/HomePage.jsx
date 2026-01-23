import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { axiosInstance } from '../lib/axios';
import { toast } from 'react-hot-toast';
import { MapPin, Droplet, Calendar, Shield, Power } from 'lucide-react';

const HomePage = () => {
  const { authUser, checkAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      await axiosInstance.put('/auth/toggle-availability');
      await checkAuth(); // Refresh user data to show new status
      toast.success(authUser.isAvailable ? "You are now Offline 🔕" : "You are Active to Donate! 🩸");
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* WELCOME CARD */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
           <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Welcome, {authUser?.fullName?.split(' ')[0]}! 👋
              </h1>
              <p className="text-gray-500 mt-2">
                Blood Group: <span className="font-bold text-[#b30000] bg-red-50 px-2 py-1 rounded">{authUser?.bloodGroup}</span>
              </p>
           </div>
           
           {/* STATUS TOGGLE */}
           <button 
             onClick={handleToggle}
             disabled={loading}
             className={`flex items-center gap-3 px-6 py-3 rounded-xl font-bold transition-all shadow-md ${
                authUser?.isAvailable 
                ? 'bg-green-100 text-green-800 hover:bg-green-200 border border-green-200' 
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-300'
             }`}
           >
             <Power size={20} />
             {authUser?.isAvailable ? "Status: ACTIVE" : "Status: UNAVAILABLE"}
           </button>
        </div>

        {/* INFO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Location Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="bg-blue-50 w-fit p-3 rounded-full mb-4">
                    <MapPin className="text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-800">Your Location</h3>
                <p className="text-sm text-gray-500 mt-1">
                    Emergency alerts are based on this GPS point.
                </p>
                <div className="mt-4 text-xs font-mono bg-gray-50 p-2 rounded truncate">
                    {authUser?.location?.coordinates ? 
                        `${authUser.location.coordinates[1].toFixed(4)}, ${authUser.location.coordinates[0].toFixed(4)}` 
                        : "No GPS Data"}
                </div>
            </div>

            {/* Impact Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="bg-red-50 w-fit p-3 rounded-full mb-4">
                    <Droplet className="text-[#b30000]" />
                </div>
                <h3 className="font-bold text-gray-800">Donation Impact</h3>
                <p className="text-sm text-gray-500 mt-1">
                    Every donation can save up to 3 lives.
                </p>
                <div className="mt-4 font-bold text-2xl text-gray-800">
                    0 <span className="text-sm font-normal text-gray-400">Lives Saved</span>
                </div>
            </div>

            {/* Next Eligible Date */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="bg-purple-50 w-fit p-3 rounded-full mb-4">
                    <Calendar className="text-purple-600" />
                </div>
                <h3 className="font-bold text-gray-800">Next Donation</h3>
                <p className="text-sm text-gray-500 mt-1">
                    You are eligible to donate immediately.
                </p>
                <button className="mt-4 text-sm text-blue-600 font-bold hover:underline">
                    Log a recent donation &rarr;
                </button>
            </div>
        </div>

        {/* RECENT ALERTS BANNER */}
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 flex items-start gap-4">
            <Shield className="text-orange-600 shrink-0 mt-1" />
            <div>
                <h3 className="font-bold text-orange-800">System Status: Operational</h3>
                <p className="text-sm text-orange-700 mt-1">
                    You are connected to the BloodLink Emergency Network. Keep your phone nearby. 
                    If a hospital within 10km needs <b>{authUser?.bloodGroup}</b> blood, you will receive an Email alert immediately.
                </p>
            </div>
        </div>

      </div>
    </div>
  );
};

export default HomePage;