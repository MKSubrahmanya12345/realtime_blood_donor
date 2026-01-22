import React from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Calendar, Droplet, Clock, MapPin } from 'lucide-react';

const HomePage = () => {
  const { authUser } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-[#b30000] to-[#800000] rounded-2xl p-8 text-white shadow-xl mb-10">
           <h1 className="text-3xl md:text-4xl font-bold mb-2">
             Welcome back, {authUser?.fullName}! 👋
           </h1>
           <p className="opacity-90">
             You are saving lives. Here is your donation overview.
           </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
           {/* Stat 1 */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="bg-red-100 p-3 rounded-full">
                 <Droplet className="text-[#b30000] w-8 h-8" fill="currentColor" />
              </div>
              <div>
                 <p className="text-sm text-gray-500 font-medium">Blood Group</p>
                 <h3 className="text-2xl font-bold text-gray-800">{authUser?.bloodGroup || "N/A"}</h3>
              </div>
           </div>

           {/* Stat 2 */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-full">
                 <Calendar className="text-blue-600 w-8 h-8" />
              </div>
              <div>
                 <p className="text-sm text-gray-500 font-medium">Last Donation</p>
                 <h3 className="text-xl font-bold text-gray-800">--/--/----</h3>
              </div>
           </div>

           {/* Stat 3 */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-full">
                 <Clock className="text-green-600 w-8 h-8" />
              </div>
              <div>
                 <p className="text-sm text-gray-500 font-medium">Next Eligible</p>
                 <h3 className="text-xl font-bold text-green-700">Available Now</h3>
              </div>
           </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Requests Nearby</h3>
              <div className="space-y-4">
                 <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                       <div className="bg-[#b30000] text-white w-10 h-10 rounded-full flex items-center justify-center font-bold">A+</div>
                       <div>
                          <p className="font-semibold text-gray-800">Apollo Hospital</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin size={12}/> 2.5km away</p>
                       </div>
                    </div>
                    <button className="text-[#b30000] text-sm font-semibold hover:underline">View</button>
                 </div>
                 {/* More items... */}
              </div>
           </div>

           <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                 <button className="p-4 bg-red-50 text-[#b30000] rounded-lg font-semibold hover:bg-red-100 transition">Request Blood</button>
                 <button className="p-4 bg-gray-50 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition">Locate Camps</button>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default HomePage;