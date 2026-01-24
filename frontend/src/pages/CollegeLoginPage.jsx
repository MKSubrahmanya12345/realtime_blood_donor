import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Link, useNavigate } from 'react-router-dom';
import { School, LogIn, Loader } from 'lucide-react';
import { toast } from 'react-hot-toast';

const CollegeLoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { login, isLoggingIn } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = await login(formData); 
    
    if (user) {
        if (user.role === 'college') {
            navigate('/college'); 
        } else {
            toast.error("Access Denied. Not a College Account.");
            navigate('/'); 
        }
    }
  };

  return (
    <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-indigo-100 p-8">
        <div className="text-center mb-8">
          <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <School className="w-8 h-8 text-indigo-700" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">College Portal Login</h2>
          <p className="text-gray-500 text-sm mt-1">Manage Blood Drives & Student Verifications</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">College Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="admin@college.edu"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full bg-indigo-700 text-white py-3 rounded-lg font-bold hover:bg-indigo-800 transition flex items-center justify-center gap-2"
          >
            {isLoggingIn ? <Loader className="animate-spin" size={20} /> : <LogIn size={20} />}
            Login to Dashboard
          </button>
        </form>
        
        <p className="mt-6 text-center text-sm text-gray-600">
          Not registered? <Link to="/college/register" className="text-indigo-700 font-bold hover:underline">Create Account</Link>
        </p>
      </div>
    </div>
  );
};

export default CollegeLoginPage;