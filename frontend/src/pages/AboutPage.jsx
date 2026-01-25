import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Globe, Clock, ShieldCheck, Users, Activity } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      
      {/* 1. HERO SECTION */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            Saving Lives, <span className="text-[#b30000]">One Notification at a Time</span>
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            BloodLink bridges the critical time gap between emergency requests and willing donors using real-time geolocation technology.
          </p>
        </div>
      </div>

      {/* 2. OUR MISSION */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
             <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-100 rounded-full text-[#b30000]">
                    <Activity size={24} />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
             </div>
             <p className="text-lg text-gray-600 leading-relaxed mb-6">
               In medical emergencies, every second counts. Traditional blood donation drives are great, but they don't solve the immediate need for a specific blood type in a specific location.
             </p>
             <p className="text-lg text-gray-600 leading-relaxed">
               <bold>BloodLink</bold> was built to solve this. By connecting hospitals directly with nearby donors via GPS, we reduce the response time from hours to minutes. We believe that technology can transform the way communities support each other.
             </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-[#b30000] text-center">
                <Clock className="w-10 h-10 mx-auto text-[#b30000] mb-3"/>
                <h3 className="font-bold text-xl">Fast</h3>
                <p className="text-sm text-gray-500">Instant alerts to nearby donors</p>
             </div>
             <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-[#b30000] text-center">
                <ShieldCheck className="w-10 h-10 mx-auto text-[#b30000] mb-3"/>
                <h3 className="font-bold text-xl">Secure</h3>
                <p className="text-sm text-gray-500">Verified Hospitals & Donors</p>
             </div>
             <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-[#b30000] text-center">
                <Globe className="w-10 h-10 mx-auto text-[#b30000] mb-3"/>
                <h3 className="font-bold text-xl">Local</h3>
                <p className="text-sm text-gray-500">Community-focused support</p>
             </div>
             <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-[#b30000] text-center">
                <Users className="w-10 h-10 mx-auto text-[#b30000] mb-3"/>
                <h3 className="font-bold text-xl">Network</h3>
                <p className="text-sm text-gray-500">Growing donor database</p>
             </div>
          </div>
        </div>
      </div>

      {/* 3. WHO WE ARE */}
      <div className="bg-[#b30000] text-white py-16 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
           <Heart className="w-16 h-16 mx-auto mb-4 text-red-200" />
           <h2 className="text-3xl font-bold mb-4">Built with Love & Logic</h2>
           <p className="max-w-2xl mx-auto text-lg text-red-100 mb-8">
             We are a team of developers passionate about using code for social good. BloodLink isn't just a project; it's our contribution to a safer, more connected world.
           </p>
           <Link to="/signup" className="inline-block bg-white text-[#b30000] px-8 py-3 rounded-full font-bold text-lg hover:bg-gray-100 transition shadow-lg">
             Join the Cause - Sign Up
           </Link>
        </div>
      </div>

    </div>
  );
};

export default AboutPage;