import React from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Droplet,
  LogIn,
  ClipboardCheck,
  Activity
} from 'lucide-react';

const BloodCentersPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">

        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full">
            <Building2 className="w-10 h-10 text-blue-700" />
          </div>
          <h1 className="text-4xl font-bold text-slate-800">
            Blood & Hospital Portal
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Register or login as a Hospital or Blood Center.
          </p>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">

          {/* ADD HOSPITAL */}
          <Link
            to="/hospital/register"
            className="group bg-white p-8 rounded-2xl border hover:border-blue-500 hover:shadow-xl transition"
          >
            <div className="bg-blue-50 w-fit p-3 rounded-xl mb-6 group-hover:bg-blue-600">
              <ClipboardCheck className="w-8 h-8 text-blue-700 group-hover:text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Add Your Hospital</h2>
            <p className="text-slate-500 mb-6">
              Register your hospital after license verification.
            </p>
            <span className="text-blue-600 font-semibold">
              Register Hospital →
            </span>
          </Link>

          {/* ADD BLOOD CENTER */}
          <Link
            to="/blood-center"
            className="group bg-white p-8 rounded-2xl border hover:border-red-500 hover:shadow-xl transition"
          >
            <div className="bg-red-50 w-fit p-3 rounded-xl mb-6 group-hover:bg-red-600">
              <Droplet className="w-8 h-8 text-red-600 group-hover:text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Add Your Blood Center</h2>
            <p className="text-slate-500 mb-6">
              Register a licensed blood bank or blood center.
            </p>
            <span className="text-red-600 font-semibold">
              Register Blood Center →
            </span>
          </Link>

          {/* HOSPITAL LOGIN */}
          <Link
            to="/hospital/login"
            className="group bg-blue-900 p-8 rounded-2xl text-white hover:bg-blue-800 transition"
          >
            <div className="bg-blue-800 w-fit p-3 rounded-xl mb-6">
              <LogIn className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Hospital Login</h2>
            <p className="text-blue-200 mb-6">
              Access hospital dashboard & blood requests.
            </p>
            <span className="font-semibold">
              Login as Hospital →
            </span>
          </Link>

          {/* BLOOD CENTER LOGIN */}
          <Link
            to="/blood-center/login"
            className="group bg-red-700 p-8 rounded-2xl text-white hover:bg-red-600 transition"
          >
            <div className="bg-red-600 w-fit p-3 rounded-xl mb-6">
              <LogIn className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Blood Center Login</h2>
            <p className="text-red-200 mb-6">
              Manage inventory, camps & emergency supply.
            </p>
            <span className="font-semibold">
              Login as Blood Center →
            </span>
          </Link>

        </div>

        {/* Footer */}
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
