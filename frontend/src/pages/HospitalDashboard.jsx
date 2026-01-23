import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { PlusCircle, Activity, Users, AlertTriangle, Loader, Droplet, MapPin, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { axiosInstance } from '../lib/axios';

// === MAP IMPORTS ===
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet marker icons missing in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// === COMPONENT: DRAGGABLE MARKER ===
function DraggableMarker({ position, setPosition }) {
  const markerRef = useRef(null);
  
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const { lat, lng } = marker.getLatLng();
          setPosition({ lat, lng }); // Update parent state
        }
      },
    }),
    [setPosition],
  );

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}>
      <Popup minWidth={90}>
        <span>Compendium Hospital Location</span>
      </Popup>
    </Marker>
  );
}

const HospitalDashboard = () => {
  const { authUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [hospitalInfo, setHospitalInfo] = useState(null);
  
  // MAP STATE
  const [markerPosition, setMarkerPosition] = useState({ lat: 12.9716, lng: 77.5946 }); // Default Bangalore
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);

  // Default inventory in case DB is empty
  const [inventory, setInventory] = useState({
    'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0,
    'AB+': 0, 'AB-': 0, 'O+': 0, 'O-': 0
  });

  const [requestData, setRequestData] = useState({
    bloodGroup: 'A+',
    units: 1,
    urgency: 'Critical'
  });

  const [requestLoading, setRequestLoading] = useState(false);

  // === 1. FETCH HOSPITAL DATA ON LOAD ===
  useEffect(() => {
    const fetchHospitalData = async () => {
      try {
        const res = await axiosInstance.get('/hospital/me');
        setHospitalInfo(res.data);
        if (res.data.inventory) setInventory(res.data.inventory);
        
        // Set Map Position from DB if available
        if (res.data.location && res.data.location.coordinates) {
             // MongoDB is [Lng, Lat], Leaflet needs [Lat, Lng]
             setMarkerPosition({
                 lat: res.data.location.coordinates[1],
                 lng: res.data.location.coordinates[0]
             });
        }
      } catch (error) {
        console.error("Error fetching hospital data:", error);
        toast.error("Could not load hospital profile");
      } finally {
        setLoading(false);
      }
    };

    fetchHospitalData();
  }, []);

  // === 2. UPDATE LOCATION HANDLER ===
  const handleUpdateLocation = async () => {
      setIsUpdatingLocation(true);
      try {
          // Send new coordinates to Backend
          // NOTE: Ensure your /hospital/update-profile route exists or reuse auth route
          await axiosInstance.put('/auth/update-profile', {
              latitude: markerPosition.lat,
              longitude: markerPosition.lng
          });
          toast.success("Hospital Location Updated!");
      } catch (error) {
          toast.error("Failed to update location.");
      } finally {
          setIsUpdatingLocation(false);
      }
  };

  // === 3. HANDLE BLOOD REQUEST ===
  const handleRequest = async (e) => {
    e.preventDefault();
    setRequestLoading(true);
    try {
        const res = await axiosInstance.post('/hospital/request', requestData);
        toast.success(
            <div className="flex flex-col">
                <span className="font-bold">Broadcast Sent! 📡</span>
                <span className="text-sm">Notified {res.data.donorsFound} donors nearby.</span>
            </div>,
            { duration: 5000 }
        );
    } catch (error) {
        toast.error(error.response?.data?.message || "Failed to send alert.");
    } finally {
        setRequestLoading(false);
    }
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center h-screen bg-gray-50">
            <Loader className="animate-spin text-blue-900" size={40} />
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                        <Activity className="text-blue-900" />
                    </div>
                    {hospitalInfo?.hospitalName || "Hospital Dashboard"}
                </h1>
                <p className="text-gray-500 mt-1 ml-1">
                    License: <span className="font-mono text-gray-700 bg-gray-200 px-2 py-0.5 rounded text-sm">{hospitalInfo?.licenseNumber}</span>
                </p>
            </div>
            
            <div className="flex gap-3">
                <button className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition">
                    <Users size={18} /> Donor Database
                </button>
                <button className="flex items-center gap-2 bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800 font-medium transition shadow-sm">
                    <PlusCircle size={18} /> Update Stock
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT COLUMN: INVENTORY & MAP */}
            <div className="lg:col-span-2 space-y-8">
                
                {/* 1. INVENTORY CARD */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800">
                        <Droplet className="text-red-500 fill-current" size={20} /> 
                        Live Blood Inventory
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {Object.entries(inventory).map(([group, count]) => (
                            <div key={group} className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
                                count < 5 
                                ? 'bg-red-50 border-red-100 hover:border-red-300' 
                                : 'bg-emerald-50 border-emerald-100 hover:border-emerald-300'
                            }`}>
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-2xl font-black text-gray-800">{group}</h3>
                                    {count < 5 && (
                                        <span className="bg-red-200 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">Low</span>
                                    )}
                                </div>
                                <p className={`text-lg font-bold ${count < 5 ? 'text-red-700' : 'text-emerald-700'}`}>
                                    {count} <span className="text-sm font-medium opacity-70">Units</span>
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. LOCATION MAP CARD (NEW) */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                     <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                            <MapPin className="text-blue-600" size={20} /> 
                            Update Hospital Location
                        </h2>
                        <button 
                            onClick={handleUpdateLocation}
                            disabled={isUpdatingLocation}
                            className="flex items-center gap-2 bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-green-700 transition"
                        >
                             {isUpdatingLocation ? <Loader size={16} className="animate-spin"/> : <Save size={16}/>}
                             Save New Location
                        </button>
                     </div>
                     
                     <div className="h-64 w-full rounded-xl overflow-hidden border-2 border-gray-200 relative z-0">
                         {/* MAP CONTAINER */}
                         <MapContainer 
                            center={markerPosition} 
                            zoom={13} 
                            style={{ height: "100%", width: "100%" }}
                         >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <DraggableMarker position={markerPosition} setPosition={setMarkerPosition} />
                         </MapContainer>
                     </div>
                     <p className="text-xs text-gray-500 mt-2 text-center">
                        *Drag the marker to pinpoint your exact hospital entrance.
                     </p>
                </div>

            </div>

            {/* RIGHT COLUMN: REQUEST FORM */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border-t-4 border-red-600 h-fit">
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-red-100 p-2 rounded-full animate-pulse">
                        <AlertTriangle className="text-red-600" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Emergency Broadcast</h2>
                        <p className="text-xs text-red-600 font-bold uppercase tracking-wider">High Priority Alert</p>
                    </div>
                </div>

                <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                    This tool will locate registered donors within <span className="font-bold text-gray-900">10 KM</span> of your facility and send immediate SMS/Email alerts.
                </p>

                <form onSubmit={handleRequest} className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Blood Group Required</label>
                        <select 
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-gray-50"
                            value={requestData.bloodGroup}
                            onChange={(e) => setRequestData({...requestData, bloodGroup: e.target.value})}
                        >
                            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Units Needed</label>
                        <input 
                            type="number" 
                            min="1"
                            max="50"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-gray-50"
                            value={requestData.units}
                            onChange={(e) => setRequestData({...requestData, units: e.target.value})}
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={requestLoading}
                        className="w-full bg-red-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-red-700 transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {requestLoading ? <Loader className="animate-spin" /> : <AlertTriangle className="fill-current" />}
                        {requestLoading ? "Broadcasting..." : "Find Donors Nearby"}
                    </button>
                </form>
            </div>

        </div>
      </div>
    </div>
  );
};

export default HospitalDashboard;