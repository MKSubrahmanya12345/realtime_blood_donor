import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from '../lib/axios';
import { toast } from 'react-hot-toast';
import { Building2, MapPin, Loader, User, Lock, Phone, FileText, Clock, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

const HospitalOnboardingPage = () => {
  const navigate = useNavigate();
  const { checkAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  const [formData, setFormData] = useState({
    // Admin User Credentials
    fullName: '',
    email: '',
    password: '',
    phone: '',
    
    // Hospital Profile
    hospitalName: '',
    licenseNumber: '',
    address: '',
    latitude: '',
    longitude: '',
    capacity: '',
    hasEmergencyServices: false,
    operatingHours: '24/7'
  });

  // === GPS LOGIC ===
  const getCurrentLocation = () => {
    setGpsLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          toast.success("Location Captured Successfully!");
          setGpsLoading(false);
        },
        (error) => {
          console.error(error);
          toast.error("Could not fetch location. Please allow permissions.");
          setGpsLoading(false);
        }
      );
    } else {
      toast.error("GPS not supported on this device.");
      setGpsLoading(false);
    }
  };

  // === SUBMIT LOGIC ===
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.latitude) {
        toast.error("Please click 'Get Current GPS' to set the facility location.");
        setLoading(false);
        return;
    }

    try {
      // This hits the new "One-Shot" endpoint
      await axiosInstance.post('/hospital/register', formData);
      toast.success("Registration Successful! Welcome.");
      
      // Update auth state immediately so they are logged in
      await checkAuth(); 
      navigate('/hospital'); // Go straight to Dashboard

    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        
        {/* HEADER */}
        <div className="bg-blue-900 p-8 text-white text-center">
            <Building2 className="w-16 h-16 mx-auto mb-4 text-blue-300" />
            <h2 className="text-3xl font-bold">Register Blood Center</h2>
            <p className="text-blue-200 mt-2 text-lg">
                Create an admin account and register your facility in one step.
            </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* LEFT COLUMN: ADMIN CREDENTIALS */}
            <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2 mb-4">
                    <User className="text-blue-900" />
                    <h3 className="text-xl font-bold text-slate-800">Admin Credentials</h3>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Admin Full Name</label>
                    <input type="text" name="fullName" required placeholder="Dr. Name or Admin Name"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none transition"
                        onChange={handleChange} 
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Official Email</label>
                    <input type="email" name="email" required placeholder="admin@hospital.com"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none transition"
                        onChange={handleChange} 
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                        <input type="password" name="password" required placeholder="••••••••"
                            className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none transition"
                            onChange={handleChange} 
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Personal Contact</label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                        <input type="tel" name="phone" required placeholder="+91 98765 43210"
                            className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none transition"
                            onChange={handleChange} 
                        />
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN: HOSPITAL DETAILS */}
            <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2 mb-4">
                    <Building2 className="text-blue-900" />
                    <h3 className="text-xl font-bold text-slate-800">Facility Details</h3>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hospital / Blood Bank Name</label>
                    <input type="text" name="hospitalName" required placeholder="City General Hospital"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none transition"
                        onChange={handleChange} 
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">License No.</label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                            <input type="text" name="licenseNumber" required placeholder="LIC-1234"
                                className="w-full pl-10 p-3 border border-gray-300 rounded-lg outline-none"
                                onChange={handleChange} 
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Total Beds</label>
                        <input type="number" name="capacity" required placeholder="500"
                            className="w-full p-3 border border-gray-300 rounded-lg outline-none"
                            onChange={handleChange} 
                        />
                    </div>
                </div>

                {/* LOCATION BOX */}
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <label className="block text-xs font-bold text-blue-800 uppercase mb-2">Facility Location</label>
                    <input type="text" name="address" required placeholder="Street Address, City, Zip"
                        className="w-full p-2 mb-3 border border-blue-200 rounded text-sm focus:border-blue-500 outline-none"
                        onChange={handleChange} 
                    />
                    
                    <button type="button" onClick={getCurrentLocation}
                        className={`w-full py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-bold border transition ${formData.latitude ? 'bg-green-600 text-white border-green-600 shadow-sm' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
                    >
                        {gpsLoading ? <Loader className="animate-spin" size={16}/> : <MapPin size={16} />}
                        {formData.latitude ? "GPS Captured Successfully ✅" : "Detect Current GPS Location"}
                    </button>
                </div>

                {/* EXTRAS */}
                <div className="flex items-center gap-4 p-3 border rounded-lg bg-gray-50">
                    <div className="flex items-center gap-2">
                        <input type="checkbox" id="emergency" className="w-5 h-5 accent-blue-900"
                            checked={formData.hasEmergencyServices}
                            onChange={(e) => setFormData({...formData, hasEmergencyServices: e.target.checked})}
                        />
                        <label htmlFor="emergency" className="text-sm font-medium text-gray-700 cursor-pointer">Emergency Services</label>
                    </div>
                    
                    <div className="h-6 w-px bg-gray-300"></div>

                    <div className="flex items-center gap-2 flex-1">
                        <Clock size={16} className="text-gray-500" />
                        <input type="text" placeholder="Hours (e.g. 24/7)" 
                            className="bg-transparent border-none text-sm focus:ring-0 p-0 w-full"
                            value={formData.operatingHours}
                            onChange={(e) => setFormData({...formData, operatingHours: e.target.value})}
                        />
                    </div>
                </div>

            </div>

            {/* SUBMIT BUTTON */}
            <div className="md:col-span-2 pt-4">
                <button type="submit" disabled={loading} 
                    className="w-full bg-blue-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-800 transition shadow-lg disabled:opacity-70 flex items-center justify-center gap-2"
                >
                    {loading ? <Loader className="animate-spin" /> : <Building2 />}
                    {loading ? "Registering Facility..." : "Complete Registration & Access Dashboard"}
                </button>
                <p className="text-center text-gray-500 text-sm mt-4 flex items-center justify-center gap-1">
                    <AlertCircle size={14} /> By registering, you agree to national blood bank standards.
                </p>
            </div>

        </form>
      </div>
    </div>
  );
};

export default HospitalOnboardingPage;