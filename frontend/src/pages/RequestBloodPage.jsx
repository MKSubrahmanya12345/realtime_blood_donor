import React, { useState } from 'react';
import { axiosInstance } from '../lib/axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Activity, MapPin, Loader } from 'lucide-react';

const RequestBloodPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    patientName: '',
    bloodGroup: '',
    unitsRequired: 1,
    hospitalName: '',
    location: '',      // Text Address
    latitude: '',      // New Field
    longitude: '',     // New Field
    urgency: 'Medium',
    contactNumber: '',
    note: ''
  });

  // === GPS FUNCTION ===
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
          toast.success("Location Captured!");
          setGpsLoading(false);
        },
        () => {
          toast.error("Could not fetch location.");
          setGpsLoading(false);
        }
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.latitude || !formData.longitude) {
        toast.error("Please click 'Get GPS' to find nearby donors.");
        setLoading(false);
        return;
    }

    try {
      await axiosInstance.post('/requests/create', formData);
      toast.success("Request Sent! Notifying nearby donors...");
      navigate('/');
    } catch (error) {
      toast.error("Failed to post request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center py-12 px-4">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center gap-3 mb-6">
           <div className="bg-red-100 p-3 rounded-full"><Activity className="text-[#b30000]" /></div>
           <h2 className="text-2xl font-bold text-gray-800">Create Blood Request</h2>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Patient Name */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
            <input type="text" required className="w-full p-2 border rounded-md" 
              onChange={(e) => setFormData({...formData, patientName: e.target.value})} 
            />
          </div>

          {/* Blood Group */}
          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group Needed</label>
             <select className="w-full p-2 border rounded-md" required onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})}>
               <option value="">Select</option>
               {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => <option key={g} value={g}>{g}</option>)}
             </select>
          </div>

          {/* Units */}
          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Units Required</label>
             <input type="number" min="1" required className="w-full p-2 border rounded-md"
               onChange={(e) => setFormData({...formData, unitsRequired: e.target.value})} 
             />
          </div>

          {/* Urgency */}
          <div className="md:col-span-2">
             <label className="block text-sm font-medium text-gray-700 mb-1">Urgency Level</label>
             <div className="flex gap-4 mt-2">
                {['Low', 'Medium', 'Critical'].map(level => (
                  <label key={level} className={`cursor-pointer px-4 py-2 rounded-lg border ${formData.urgency === level ? 'bg-red-50 border-[#b30000] text-[#b30000]' : 'border-gray-200'}`}>
                    <input type="radio" name="urgency" value={level} className="hidden" 
                      onChange={(e) => setFormData({...formData, urgency: e.target.value})} 
                    />
                    {level}
                  </label>
                ))}
             </div>
          </div>

          {/* Hospital & Location */}
          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Name</label>
             <input type="text" required className="w-full p-2 border rounded-md"
               onChange={(e) => setFormData({...formData, hospitalName: e.target.value})} 
             />
          </div>
          
          {/* LOCATION WITH GPS */}
          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">City / Area</label>
             <div className="flex gap-2">
                 <input type="text" required className="w-full p-2 border rounded-md"
                   placeholder="e.g. Indiranagar"
                   onChange={(e) => setFormData({...formData, location: e.target.value})} 
                 />
                 <button type="button" onClick={getCurrentLocation}
                    className={`px-3 py-2 rounded-md border flex items-center justify-center ${formData.latitude ? 'bg-green-100 border-green-500 text-green-700' : 'bg-gray-100 border-gray-300'}`}
                 >
                    {gpsLoading ? <Loader className="animate-spin" size={18}/> : <MapPin size={18}/>}
                 </button>
             </div>
          </div>

          {/* Contact */}
          <div className="md:col-span-2">
             <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
             <input type="tel" required className="w-full p-2 border rounded-md"
               onChange={(e) => setFormData({...formData, contactNumber: e.target.value})} 
             />
          </div>

          <button type="submit" disabled={loading} className="md:col-span-2 bg-[#b30000] text-white py-3 rounded-lg font-bold hover:bg-[#900000] transition mt-4">
             {loading ? "Broadcasting..." : "Post Emergency Request"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RequestBloodPage;