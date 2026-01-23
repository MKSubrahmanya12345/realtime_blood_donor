import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from '../lib/axios';
import { toast } from 'react-hot-toast';
import { Building2, MapPin, Loader, FileText, Phone, Clock } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

const HospitalRegistrationPage = () => {
  const navigate = useNavigate();
  const { checkAuth } = useAuthStore(); // To refresh role after success
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  const [formData, setFormData] = useState({
    hospitalName: '',
    email: '',
    contactNumber: '',
    licenseNumber: '',
    address: '',
    latitude: '',
    longitude: '',
    capacity: '',
    hasEmergencyServices: false,
    operatingHours: '24/7'
  });

  // === GPS LOGIC (Reused) ===
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
          toast.success("Hospital Location Captured!");
          setGpsLoading(false);
        },
        (error) => {
          toast.error("Could not fetch location.");
          setGpsLoading(false);
        }
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.latitude) {
        toast.error("Please capture the exact hospital location.");
        setLoading(false);
        return;
    }

    try {
      await axiosInstance.post('/hospital/register', formData);
      toast.success("Registration Successful! Redirecting...");
      
      await checkAuth(); // Refresh user state to get the new 'hospital' role
      navigate('/hospital'); // Go to Dashboard

    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-3xl w-full bg-white rounded-xl shadow-lg overflow-hidden">
        
        <div className="bg-blue-900 p-6 text-white text-center">
            <Building2 className="w-12 h-12 mx-auto mb-2" />
            <h2 className="text-2xl font-bold">Partner with BloodLink</h2>
            <p className="text-blue-200 text-sm">Register your Hospital / Blood Bank</p>
        </div>

        <div className="p-8">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Name */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Hospital Name</label>
                    <input type="text" required 
                        className="mt-1 block w-full p-2 border rounded-md"
                        onChange={(e) => setFormData({...formData, hospitalName: e.target.value})}
                    />
                </div>

                {/* Email */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Official Email</label>
                    <input type="email" required 
                        className="mt-1 block w-full p-2 border rounded-md"
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                </div>

                {/* Contact */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Helpline Number</label>
                    <input type="tel" required 
                        className="mt-1 block w-full p-2 border rounded-md"
                        onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                    />
                </div>

                {/* License */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">License Number</label>
                    <div className="relative">
                        <FileText className="absolute left-2 top-2.5 h-5 w-5 text-gray-400" />
                        <input type="text" required placeholder="Govt. Reg. No."
                            className="mt-1 block w-full pl-9 p-2 border rounded-md"
                            onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                        />
                    </div>
                </div>

                {/* Capacity */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Total Bed Capacity</label>
                    <input type="number" required 
                        className="mt-1 block w-full p-2 border rounded-md"
                        onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                    />
                </div>

                {/* Location Block */}
                <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hospital Location</label>
                    <div className="flex gap-2">
                        <input type="text" placeholder="Street Address / Area" required
                            className="flex-1 p-2 border rounded-md"
                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                        />
                        <button type="button" onClick={getCurrentLocation}
                            className={`px-4 py-2 rounded-md flex items-center gap-2 border ${formData.latitude ? 'bg-green-100 border-green-500 text-green-700' : 'bg-white border-gray-300'}`}
                        >
                            {gpsLoading ? <Loader className="animate-spin" size={16}/> : <MapPin size={16} />}
                            {formData.latitude ? "GPS Set" : "Get GPS"}
                        </button>
                    </div>
                </div>

                {/* Toggles */}
                <div className="md:col-span-2 flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-2">
                         <input type="checkbox" className="w-5 h-5 accent-blue-900" 
                            checked={formData.hasEmergencyServices}
                            onChange={(e) => setFormData({...formData, hasEmergencyServices: e.target.checked})}
                         />
                         <span className="font-medium text-gray-700">Emergency Services Available?</span>
                    </div>
                    <div className="flex items-center gap-2">
                         <Clock size={18} className="text-gray-500"/>
                         <input type="text" placeholder="Hours (e.g. 24/7)" 
                             className="border-b focus:outline-none focus:border-blue-900"
                             onChange={(e) => setFormData({...formData, operatingHours: e.target.value})}
                         />
                    </div>
                </div>

                <button type="submit" disabled={loading} className="md:col-span-2 bg-blue-900 text-white py-3 rounded-lg font-bold hover:bg-blue-800 transition">
                    {loading ? "Registering..." : "Complete Registration"}
                </button>

            </form>
        </div>
      </div>
    </div>
  );
};

export default HospitalRegistrationPage;