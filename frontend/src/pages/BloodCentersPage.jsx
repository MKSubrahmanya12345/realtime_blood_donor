import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, LogIn, ClipboardCheck, Activity } from 'lucide-react';

const BloodCentersPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full">
        
        {/* Header Section */}
        <div className="text-center mb-12 space-y-4">
           <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-4">
              <Building2 className="w-10 h-10 text-blue-700" />
           </div>
           <h1 className="text-4xl font-bold text-slate-800">Blood Center Portal</h1>
           <p className="text-slate-600 text-lg max-w-2xl mx-auto">
             Manage your inventory, organize donation camps, and connect with thousands of donors in real-time.
             Official government-compliant platform.
           </p>
        </div>

        {/* The Two Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
           
           {/* Option 1: Register (New Hospital) */}
           <Link to="/hospital/register" className="group relative bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-blue-500 transition-all duration-300">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                 <ClipboardCheck size={100} className="text-blue-900"/>
              </div>
              <div className="flex flex-col h-full relative z-10">
                 <div className="bg-blue-50 w-fit p-3 rounded-xl mb-6 group-hover:bg-blue-600 group-hover:text-white transition">
                    <ClipboardCheck className="w-8 h-8 text-blue-700 group-hover:text-white" />
                 </div>
                 <h2 className="text-2xl font-bold text-slate-800 mb-2">Add Your Blood Center</h2>
                 <p className="text-slate-500 mb-8 flex-grow">
                    New partner? Register your hospital or blood bank. Requires official license verification.
                 </p>
                 <span className="text-blue-600 font-semibold group-hover:translate-x-2 transition-transform flex items-center gap-2">
                    Start Registration &rarr;
                 </span>
              </div>
           </Link>

           {/* Option 2: Login (Existing Hospital) */}
           {/* UPDATED LINK: Points to the specific Hospital Login Page */}
           <Link to="/hospital/login" className="group relative bg-blue-900 p-8 rounded-2xl shadow-lg border border-blue-900 hover:bg-blue-800 transition-all duration-300">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                 <LogIn size={100} className="text-white"/>
              </div>
              <div className="flex flex-col h-full relative z-10">
                 <div className="bg-blue-800 w-fit p-3 rounded-xl mb-6">
                    <LogIn className="w-8 h-8 text-white" />
                 </div>
                 <h2 className="text-2xl font-bold text-white mb-2">e-RaktKosh Login</h2>
                 <p className="text-blue-200 mb-8 flex-grow">
                    Already a partner? Sign in to access your dashboard, manage stock, and view emergency requests.
                 </p>
                 <span className="text-white font-semibold group-hover:translate-x-2 transition-transform flex items-center gap-2">
                    Access Dashboard &rarr;
                 </span>
              </div>
           </Link>

        </div>

        {/* Footer Note */}
        <div className="text-center mt-12 text-slate-400 text-sm">
           <p className="flex items-center justify-center gap-2">
             <Activity size={16} /> Secure • Government Standards • 24/7 Support
           </p>
        </div>

      </div>
    </div>
  );
};

export default BloodCentersPage;