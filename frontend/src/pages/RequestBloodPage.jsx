import React, { useState, useEffect, useRef, useMemo } from 'react';
import { axiosInstance } from '../lib/axios';
import { useAuthStore } from '../store/useAuthStore';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Activity, MapPin, Loader, AlertCircle, Phone, FileText, Navigation } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet Icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Helper: Recenter Map
const RecenterMap = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) map.setView([lat, lng], 15);
  }, [lat, lng, map]);
  return null;
};

// Helper: Draggable Marker
function DraggableMarker({ position, setFormData }) {
  const markerRef = useRef(null);
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker) {
          const { lat, lng } = marker.getLatLng();
          setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
        }
      }
    }),
    [setFormData]
  );

  return (
    <Marker
      draggable
      eventHandlers={eventHandlers}
      position={[position.lat, position.lng]}
      ref={markerRef}
    >
      <Popup minWidth={90}>Drag to Hospital Entrance</Popup>
    </Marker>
  );
}

const RequestBloodPage = () => {
  const navigate = useNavigate();
  const { authUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    patientName: '',
    bloodGroup: '',
    unitsRequired: 1,
    hospitalName: '',
    location: '',      
    latitude: 12.9716, // Default Bangalore
    longitude: 77.5946,
    urgency: 'Medium',
    contactNumber: authUser?.phone || '', // Auto-fill
    note: '' // Added Note Field
  });

  const getCurrentLocation = () => {
    setGpsLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }));
          toast.success("Location Updated!");
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

    try {
      await axiosInstance.post('/requests/create', formData);
      toast.success("Request Broadcasted Successfully! 🚨");
      navigate('/');
    } catch (error) {
      toast.error("Failed to post request.");
    } finally {
      setLoading(false);
    }
  };

  const urgencyColors = {
    Low: "bg-yellow-50 border-yellow-500 text-yellow-700",
    Medium: "bg-orange-50 border-orange-500 text-orange-700",
    Critical: "bg-red-50 border-red-600 text-red-700 animate-pulse-slow"
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center py-12 px-4">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        
        {/* HEADER */}
        <div className="bg-[#b30000] p-6 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full">
                    <Activity className="text-white" size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold">Request Blood</h2>
                    <p className="text-red-100 text-sm">Notify all donors nearby instantly</p>
                </div>
            </div>
            <AlertCircle size={32} className="text-red-200 opacity-50" />
        </div>

        <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* 1. Patient Details */}
          <div className="md:col-span-2">
            <h3 className="text-gray-800 font-bold flex items-center gap-2 mb-4 border-b pb-2">
                <FileText size={18} className="text-gray-500"/> Patient Details
            </h3>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Patient Name</label>
            <input type="text" required className="w-full p-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none" 
              onChange={(e) => setFormData({...formData, patientName: e.target.value})} 
            />
          </div>

          <div>
             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Blood Group</label>
             <select className="w-full p-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none" required onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})}>
               <option value="">Select Group</option>
               {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => <option key={g} value={g}>{g}</option>)}
             </select>
          </div>

          <div>
             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Units Needed</label>
             <input type="number" min="1" max="10" required className="w-full p-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
               value={formData.unitsRequired}
               onChange={(e) => setFormData({...formData, unitsRequired: e.target.value})} 
             />
          </div>

          <div>
             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Urgency</label>
             <select 
                className={`w-full p-3 border rounded-xl font-bold outline-none ${urgencyColors[formData.urgency] || 'bg-gray-50'}`}
                onChange={(e) => setFormData({...formData, urgency: e.target.value})}
                value={formData.urgency}
             >
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Critical">CRITICAL / LIFE THREATENING</option>
             </select>
          </div>

          {/* 2. Hospital Details */}
          <div className="md:col-span-2 mt-4">
            <h3 className="text-gray-800 font-bold flex items-center gap-2 mb-4 border-b pb-2">
                <MapPin size={18} className="text-gray-500"/> Location & Contact
            </h3>
          </div>

          <div className="md:col-span-2">
             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Hospital Name</label>
             <input type="text" required placeholder="e.g. Apollo Hospital, Bannerghatta Road" className="w-full p-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
               onChange={(e) => setFormData({...formData, hospitalName: e.target.value})} 
             />
          </div>

          <div className="md:col-span-2">
             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Pin Exact Location</label>
             <div className="h-64 rounded-xl overflow-hidden border-2 border-gray-100 relative">
                 <MapContainer center={[formData.latitude, formData.longitude]} zoom={13} style={{ height: "100%", width: "100%" }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <RecenterMap lat={formData.latitude} lng={formData.longitude} />
                    <DraggableMarker position={formData} setFormData={setFormData} />
                 </MapContainer>

                 {/* GPS BUTTON OVERLAY */}
                 <button 
                    type="button" 
                    onClick={getCurrentLocation}
                    className="absolute top-4 right-4 z-[1000] bg-white text-gray-700 px-4 py-2 rounded-lg shadow-lg font-bold text-xs flex items-center gap-2 hover:bg-gray-50"
                 >
                    {gpsLoading ? <Loader size={14} className="animate-spin"/> : <Navigation size={14} />}
                    Use Current GPS
                 </button>
             </div>
             <p className="text-[10px] text-gray-400 mt-1 text-center">
                *Drag the marker to the exact hospital entrance
             </p>
          </div>

          <div className="md:col-span-1">
             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">City / Area Name</label>
             <input type="text" required placeholder="e.g. Jayanagar 4th Block" className="w-full p-3 bg-gray-50 border rounded-xl outline-none"
               onChange={(e) => setFormData({...formData, location: e.target.value})} 
             />
          </div>

          <div className="md:col-span-1">
             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Contact Number</label>
             <div className="flex items-center gap-2 bg-gray-50 border rounded-xl p-3 focus-within:ring-2 focus-within:ring-red-500">
                <Phone size={18} className="text-gray-400" />
                <input type="tel" required value={formData.contactNumber} className="bg-transparent w-full outline-none font-medium"
                   onChange={(e) => setFormData({...formData, contactNumber: e.target.value})} 
                />
             </div>
          </div>

          {/* 3. Notes */}
          <div className="md:col-span-2">
             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Extra Notes (Optional)</label>
             <textarea 
               rows="2"
               placeholder="e.g. Patient is in ICU, ask for Nurse Sarah."
               className="w-full p-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
               onChange={(e) => setFormData({...formData, note: e.target.value})}
             ></textarea>
          </div>

          {/* SUBMIT */}
          <button type="submit" disabled={loading} className="md:col-span-2 bg-[#b30000] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#8b0000] transition shadow-lg shadow-red-200 flex items-center justify-center gap-2">
             {loading ? (
                <>
                    <Loader className="animate-spin" /> Publishing Request...
                </>
             ) : (
                "BROADCAST EMERGENCY REQUEST"
             )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RequestBloodPage;