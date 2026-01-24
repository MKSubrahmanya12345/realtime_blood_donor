import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate, Link } from "react-router-dom";
import { MapPin, Loader, School, Crosshair } from "lucide-react";
import "leaflet/dist/leaflet.css";

// Helper component to update map view when location changes
const ChangeView = ({ center }) => {
  const map = useMap();
  map.setView(center, 13);
  return null;
};

const LocationPicker = ({ setLocation }) => {
  useMapEvents({
    click(e) {
      setLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
};

const CollegeRegistrationPage = () => {
  const navigate = useNavigate();
  const { registerCollege, isSigningUp } = useAuthStore();
  
  const [formData, setFormData] = useState({
    collegeName: "",
    email: "",
    password: "",
    address: "",
  });
  
  const [location, setLocation] = useState({ lat: 12.9716, lng: 77.5946 });
  const [loadingLoc, setLoadingLoc] = useState(false);

  // === NEW: GET CURRENT LOCATION ===
  const handleCurrentLocation = (e) => {
    e.preventDefault(); // Prevent form submit
    if (!navigator.geolocation) return alert("Geolocation not supported");
    
    setLoadingLoc(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
        });
        setLoadingLoc(false);
      },
      (err) => {
        console.error(err);
        setLoadingLoc(false);
        alert("Unable to retrieve location");
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Safety check if registerCollege is missing (though we fixed it)
    if (!registerCollege) {
        alert("System Error: Registration function missing. Please refresh.");
        return;
    }

    const success = await registerCollege({
      ...formData,
      latitude: location.lat,
      longitude: location.lng
    });

    if (success) navigate("/college");
  };

  return (
    <div className="min-h-screen bg-indigo-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        
        {/* LEFT: FORM */}
        <div className="w-full md:w-1/2 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-indigo-100 p-3 rounded-full">
              <School className="text-indigo-700 w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">College Partner</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700">College Name</label>
              <input type="text" required className="w-full p-3 bg-gray-50 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none" 
                onChange={(e) => setFormData({...formData, collegeName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">Official Email</label>
              <input type="email" required className="w-full p-3 bg-gray-50 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none" 
                 onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">Password</label>
              <input type="password" required className="w-full p-3 bg-gray-50 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none" 
                 onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">Address / Campus Area</label>
              <input type="text" required className="w-full p-3 bg-gray-50 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none" 
                 onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
            </div>

            <button disabled={isSigningUp} type="submit" className="w-full bg-indigo-700 text-white py-3 rounded-xl font-bold hover:bg-indigo-800 transition shadow-lg mt-4">
              {isSigningUp ? <Loader className="animate-spin mx-auto"/> : "Register College"}
            </button>
          </form>
          
          <p className="mt-4 text-center text-sm text-gray-600">
            Already a partner? <Link to="/college/login" className="text-indigo-700 font-bold">Login here</Link>
          </p>
        </div>

        {/* RIGHT: MAP */}
        <div className="w-full md:w-1/2 bg-gray-100 relative h-64 md:h-auto">
          <MapContainer center={location} zoom={13} style={{ height: "100%", width: "100%" }}>
            <ChangeView center={location} />
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <LocationPicker setLocation={setLocation} />
            <Marker position={location}></Marker>
          </MapContainer>
          
          {/* LOCATION CONTROLS OVERLAY */}
          <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-col gap-2">
              <div className="bg-white/90 backdrop-blur p-3 rounded-lg shadow-md text-sm">
                 <div className="flex items-center gap-2 text-indigo-800 font-bold">
                    <MapPin size={16} />
                    <span>Tap map to set Campus Location</span>
                 </div>
                 <p className="text-xs text-gray-500 mt-1">Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}</p>
              </div>

              <button 
                onClick={handleCurrentLocation}
                disabled={loadingLoc}
                className="bg-white/90 backdrop-blur p-2 rounded-lg shadow-md text-sm font-bold text-gray-700 flex items-center justify-center gap-2 hover:bg-white transition"
              >
                {loadingLoc ? <Loader size={16} className="animate-spin"/> : <Crosshair size={16} />}
                Use My Current Location
              </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CollegeRegistrationPage;