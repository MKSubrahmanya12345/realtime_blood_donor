import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Loader, CheckCircle, MapPin, Navigation, User, Lock, Phone, Droplet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

// === MAP IMPORTS (Matching HospitalDashboard) ===
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// === HELPER: RECENTER MAP ===
const RecenterMap = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], 15);
    }
  }, [lat, lng, map]);
  return null;
};

// === COMPONENT: DRAGGABLE MARKER (Mirrored from HospitalDashboard) ===
function DraggableMarker({ position, setFormData }) {
  const markerRef = useRef(null);
  
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const { lat, lng } = marker.getLatLng();
          setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
        }
      },
    }),
    [setFormData],
  );

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={[position.lat, position.lng]}
      ref={markerRef}>
      <Popup minWidth={90}>
        <span>Drag to your exact location</span>
      </Popup>
    </Marker>
  );
}

const SignUpPage = () => {
  const navigate = useNavigate();
  const { signup, verifyOtp, isSigningUp, isVerifying } = useAuthStore();
  
  const [step, setStep] = useState(1); 
  const [userType, setUserType] = useState('individual');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [verificationStatus, setVerificationStatus] = useState({ email: false, phone: false });

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    bloodGroup: '',
    address: '',
    latitude: null,
    longitude: null,
    collegeName: '',
    collegeId: ''
  });

  const [locationLoading, setLocationLoading] = useState(false);

  const getCurrentLocation = () => {
    setLocationLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }));
          toast.success("GPS Location Captured!");
          setLocationLoading(false);
        },
        () => {
          toast.error("Could not fetch location. Please use the map.");
          setLocationLoading(false);
        }
      );
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSignup = async (e) => {
    e.preventDefault();
    if (userType === 'individual' && !formData.latitude) {
      return toast.error("Please pin your location on the map.");
    }
    const user = await signup(formData);
    if (user) {
      setRegisteredEmail(user.email);
      setStep(2);
    }
  };

  const handleVerify = async (type) => {
    const otp = type === 'email' ? emailOtp : phoneOtp;
    if (!otp) return;
    const result = await verifyOtp(registeredEmail, otp, type);
    if (result === "SUCCESS") navigate('/');
    else if (result === "PARTIAL") setVerificationStatus(prev => ({ ...prev, [type]: true }));
  };

  const renderForm = () => (
    <div className="w-full md:w-1/2 p-8 overflow-y-auto max-h-[90vh]">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Create Account</h2>
      
      <div className="flex justify-center mb-6 bg-gray-100 p-1 rounded-lg">
         <button type="button" onClick={() => setUserType('individual')} className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition ${userType === 'individual' ? 'bg-[#8b0000] text-white shadow' : 'text-gray-600 hover:bg-gray-200'}`}>Individual</button>
         <button type="button" onClick={() => setUserType('college')} className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition ${userType === 'college' ? 'bg-[#8b0000] text-white shadow' : 'text-gray-600 hover:bg-gray-200'}`}>College</button>
      </div>

      <form onSubmit={handleSignup} className="space-y-4">
        {/* Basic Fields */}
        <div>
           <label className="block text-sm font-medium text-gray-700">Full Name</label>
           <input type="text" name="fullName" required onChange={handleChange} className="mt-1 block w-full px-3 py-2 border rounded-md focus:ring-[#8b0000] outline-none" />
        </div>
        <div>
           <label className="block text-sm font-medium text-gray-700">Email Address</label>
           <input type="email" name="email" required onChange={handleChange} className="mt-1 block w-full px-3 py-2 border rounded-md focus:ring-[#8b0000] outline-none" />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input type="password" name="password" required onChange={handleChange} className="mt-1 block w-full px-3 py-2 border rounded-md focus:ring-[#8b0000] outline-none" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input type="tel" name="phone" required onChange={handleChange} className="mt-1 block w-full px-3 py-2 border rounded-md focus:ring-[#8b0000] outline-none" />
            </div>
        </div>

        {userType === 'individual' && (
          <div className="space-y-4">
             <div>
                <label className="block text-sm font-medium text-gray-700">Blood Group</label>
                <select name="bloodGroup" required onChange={handleChange} className="mt-1 block w-full px-3 py-2 border rounded-md focus:ring-[#8b0000] outline-none">
                  <option value="">Select</option>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => <option key={g} value={g}>{g}</option>)}
                </select>
             </div>
             
             {/* MAP SECTION (Mirrored from HospitalDashboard) */}
             <div className="space-y-2">
               <div className="flex justify-between items-center">
                 <label className="block text-sm font-medium text-gray-700">Capture Your Location</label>
                 <button type="button" onClick={getCurrentLocation} className="text-xs font-bold text-[#8b0000] flex items-center gap-1 hover:underline">
                   {locationLoading ? <Loader size={12} className="animate-spin"/> : <Navigation size={12} />}
                   Detect via GPS
                 </button>
               </div>

               <div className="h-64 w-full rounded-xl overflow-hidden border-2 border-gray-200 relative z-0">
                  <MapContainer 
                    center={[formData.latitude || 12.9716, formData.longitude || 77.5946]} 
                    zoom={13} 
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <RecenterMap lat={formData.latitude} lng={formData.longitude} />
                    {formData.latitude && (
                        <DraggableMarker 
                            position={{ lat: formData.latitude, lng: formData.longitude }} 
                            setFormData={setFormData} 
                        />
                    )}
                  </MapContainer>
               </div>
               <p className="text-[10px] text-gray-500 italic text-center">
                 *Click GPS to find you, then drag the pin to your exact home.
               </p>
             </div>
          </div>
        )}

        {userType === 'college' && (
           <div className="space-y-4">
             <div>
               <label className="block text-sm font-medium text-gray-700">College Name</label>
               <input type="text" name="collegeName" onChange={handleChange} className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-[#8b0000]" />
             </div>
             <div>
               <label className="block text-sm font-medium text-gray-700">College ID</label>
               <input type="text" name="collegeId" onChange={handleChange} className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-[#8b0000]" />
             </div>
           </div>
        )}

        <button type="submit" disabled={isSigningUp} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#b30000] hover:bg-[#8b0000] disabled:opacity-50">
          {isSigningUp ? <Loader className="animate-spin" size={20} /> : "Create Account"}
        </button>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8 px-4">
      <div className="max-w-4xl w-full bg-white rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row">
        <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-[#ffeaea] p-8 text-center">
          <h2 className="text-3xl font-bold text-[#8b0000] mb-4">Join the Network</h2>
          <p className="text-gray-700">Every donation gives someone another chance at life.</p>
        </div>
        {step === 1 ? renderForm() : (
            <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
                <h2 className="text-2xl font-bold text-center text-[#8b0000] mb-6">Verify Contact</h2>
                <div className="space-y-4">
                    <div className="flex gap-2">
                        <input type="text" placeholder="Email OTP" value={emailOtp} onChange={(e) => setEmailOtp(e.target.value)} className="flex-1 p-2 border rounded" />
                        <button onClick={() => handleVerify('email')} disabled={isVerifying} className="bg-blue-600 text-white px-4 py-2 rounded">Verify</button>
                    </div>
                    <div className="flex gap-2">
                        <input type="text" placeholder="Phone OTP" value={phoneOtp} onChange={(e) => setPhoneOtp(e.target.value)} className="flex-1 p-2 border rounded" />
                        <button onClick={() => handleVerify('phone')} disabled={isVerifying} className="bg-blue-600 text-white px-4 py-2 rounded">Verify</button>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default SignUpPage;