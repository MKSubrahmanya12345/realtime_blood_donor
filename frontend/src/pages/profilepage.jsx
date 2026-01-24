import React, { useState, useEffect, useRef } from 'react';
import "leaflet/dist/leaflet.css";  
import { useAuthStore } from '../store/useAuthStore';
import { Loader, MapPin, Navigation, Save, User, Phone, Droplet } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet marker icons
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
});

const RecenterMap = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) map.setView([lat, lng], 15);
  }, [lat, lng, map]);
  return null;
};

const LocationPicker = ({ setFormData }) => {
  useMapEvents({
    click(e) {
      setFormData(prev => ({ ...prev, latitude: e.latlng.lat, longitude: e.latlng.lng }));
      toast.success("New location pinned!");
    }
  });
  return null;
};

const ProfilePage = () => {
  const { authUser, updateProfile, isCheckingAuth } = useAuthStore();
  const markerRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: authUser?.fullName || '',
    phone: authUser?.phone || '',
    address: authUser?.address || '',
    latitude: authUser?.location?.coordinates[1] || null,
    longitude: authUser?.location?.coordinates[0] || null,
    isAvailable: authUser?.isAvailable ?? true
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
          toast.success("GPS Location Updated!");
          setGpsLoading(false);
        },
        () => {
          toast.error("Could not fetch GPS.");
          setGpsLoading(false);
        }
      );
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    await updateProfile(formData);
    setLoading(false);
  };

  if (isCheckingAuth || !authUser) return <div className="h-screen flex items-center justify-center"><Loader className="animate-spin text-[#8b0000]" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row border border-gray-200">
        
        {/* Sidebar Info */}
        <div className="md:w-1/3 bg-[#8b0000] p-8 text-white flex flex-col items-center text-center">
          <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg">
            <User size={64} className="text-[#8b0000]" />
          </div>
          <h2 className="text-2xl font-bold">{authUser.fullName}</h2>
          <p className="opacity-80 mb-6">{authUser.email}</p>
          
          <div className="w-full bg-[#a00000] p-4 rounded-xl space-y-3">
             <div className="flex items-center justify-between">
                <span className="text-sm">Status:</span>
                <span className={`px-2 py-1 rounded text-xs font-bold ${formData.isAvailable ? 'bg-green-500' : 'bg-gray-500'}`}>
                   {formData.isAvailable ? "ACTIVE DONOR" : "UNAVAILABLE"}
                </span>
             </div>
             <div className="flex items-center justify-between">
                <span className="text-sm">Blood Group:</span>
                <span className="font-bold flex items-center gap-1"><Droplet size={14}/> {authUser.bloodGroup || 'N/A'}</span>
             </div>
          </div>
        </div>

        {/* Update Form */}
        <form onSubmit={handleUpdate} className="md:w-2/3 p-8 space-y-6">
          <h3 className="text-xl font-bold text-gray-800 border-b pb-2">Update Profile & Location</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input type="text" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} className="mt-1 block w-full px-3 py-2 border rounded-md focus:ring-[#8b0000] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="mt-1 block w-full px-3 py-2 border rounded-md focus:ring-[#8b0000] outline-none" />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Live Location</label>
              <button type="button" onClick={getCurrentLocation} className="text-xs flex items-center gap-1 text-[#8b0000] font-bold">
                {gpsLoading ? <Loader size={12} className="animate-spin" /> : <Navigation size={12} />} Update via GPS
              </button>
            </div>
            <input type="text" placeholder="Street/Area Address" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full px-3 py-2 border rounded-md mb-2 focus:ring-[#8b0000] outline-none" />
            
            <div style={{ height: "200px" }} className="w-full rounded-lg overflow-hidden border">
              <MapContainer center={[formData.latitude || 12.97, formData.longitude || 77.59]} zoom={13} className="h-full w-full">
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <RecenterMap lat={formData.latitude} lng={formData.longitude} />
                <LocationPicker setFormData={setFormData} />
                {formData.latitude && <Marker position={[formData.latitude, formData.longitude]} ref={markerRef} />}
              </MapContainer>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
            <input type="checkbox" id="avail" checked={formData.isAvailable} onChange={(e) => setFormData({...formData, isAvailable: e.target.checked})} className="w-5 h-5 accent-[#8b0000]" />
            <label htmlFor="avail" className="text-sm font-medium text-gray-700">I am currently available to donate blood</label>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-[#b30000] text-white py-3 rounded-xl font-bold hover:bg-[#8b0000] transition flex items-center justify-center gap-2">
            {loading ? <Loader className="animate-spin" size={20} /> : <Save size={20} />} Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;