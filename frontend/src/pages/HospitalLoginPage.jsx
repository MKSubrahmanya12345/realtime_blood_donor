import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, LogIn, Loader, AlertCircle, Lock } from 'lucide-react';
import { toast } from 'react-hot-toast';

const HospitalLoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const { login, isLoggingIn } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Attempt Login
    // Note: We use the same 'login' function because the backend auth is shared.
    const user = await login(formData); 
    
    if (user) {
        // 2. Security Check: Is this actually a hospital?
        if (user.role === 'hospital') {
            navigate('/hospital'); // Success -> Go to Dashboard
        } else {
            // If a Donor tries to login here, warn them but redirect to home
            toast('Welcome! Redirecting to Donor Home...', { icon: '👋' });
            navigate('/'); 
        }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
        
        {/* Header - BLUE THEME */}
        <div className="bg-blue-900 p-8 text-center">
          <div className="bg-blue-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Blood Centre Access</h2>
          <p className="text-blue-200 text-sm mt-1">Authorized Personnel Only</p>
        </div>

        {/* Form */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Official Email ID</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none transition"
                  placeholder="admin@hospital.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none transition"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-blue-900 text-white py-3 rounded-lg font-bold hover:bg-blue-800 transition flex items-center justify-center gap-2 shadow-md"
            >
              {isLoggingIn ? (
                <>
                  <Loader className="animate-spin" size={20} /> Verifying Credentials...
                </>
              ) : (
                <>
                  <LogIn size={20} /> Secure Login
                </>
              )}
            </button>

          </form>

          <div className="mt-6 text-center">
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                <AlertCircle size={14} />
                <span>Restricted Area. IP Address Monitored.</span>
            </div>
            
            <p className="mt-4 text-sm text-gray-600">
              New Facility?{' '}
              <Link to="/hospital/register" className="text-blue-900 font-bold hover:underline">
                Register Here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalLoginPage;