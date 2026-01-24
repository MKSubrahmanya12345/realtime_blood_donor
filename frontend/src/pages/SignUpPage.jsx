import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { axiosInstance } from '../lib/axios';
import { Loader, CheckCircle, MapPin, Navigation, School, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

// === MAP IMPORTS ===
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

// === COMPONENT: DRAGGABLE MARKER ===
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
      <Popup minWidth={90}>
        <span>Drag to your exact location</span>
      </Popup>
    </Marker>
  );
}

const SignUpPage = () => {
  const navigate = useNavigate();
  const { signup, verifyOtp, isSigningUp, isVerifying } = useAuthStore();

  // UI State
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState('individual');
  const [colleges, setColleges] = useState([]);

  // Verification State
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [verificationStatus, setVerificationStatus] = useState({
    email: false,
    phone: false
  });

  // Form Data
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

  // === FETCH COLLEGES ===
  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const res = await axiosInstance.get('/college/all');
        setColleges(res.data);
      } catch {
        console.error("Failed to load colleges");
      }
    };
    fetchColleges();
  }, []);

  // === MAP SYSTEM ===
  const getCurrentLocation = () => {
    setLocationLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        position => {
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

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleChange = e =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  // === STEP 1: SUBMIT REGISTRATION ===
  const handleSignup = async e => {
    e.preventDefault();

    // Snehi logic: individuals must pin GPS
    if (userType === 'individual' && !formData.latitude) {
      return toast.error("Please pin your location on the map.");
    }

    // Main logic: students must give college info
    if (userType === 'student' && (!formData.collegeName || !formData.collegeId)) {
      return toast.error("Please provide College Name and ID");
    }

    const user = await signup(formData);
    if (user) {
      setRegisteredEmail(user.email);
      setStep(2);
    }
  };

  // === STEP 2: VERIFY OTP ===
  const handleVerify = async type => {
    const otp = type === 'email' ? emailOtp : phoneOtp;
    if (!otp) return;

    const result = await verifyOtp(registeredEmail, otp, type);

    if (result === "SUCCESS") {
      navigate('/');
    } else if (result === "PARTIAL") {
      setVerificationStatus(prev => ({ ...prev, [type]: true }));
    }
  };

  // --- RENDER HELPERS ---

  const renderForm = () => (
    <div className="w-full md:w-1/2 p-8 overflow-y-auto max-h-[90vh]">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Create Donor Account
      </h2>

      {/* TOGGLE */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          type="button"
          onClick={() => setUserType('individual')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition border-2 ${
            userType === 'individual'
              ? 'bg-red-50 border-[#8b0000] text-[#8b0000]'
              : 'border-gray-200 text-gray-500 hover:bg-gray-50'
          }`}
        >
          <User size={18} /> General Donor
        </button>

        <button
          type="button"
          onClick={() => setUserType('student')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition border-2 ${
            userType === 'student'
              ? 'bg-indigo-50 border-indigo-600 text-indigo-600'
              : 'border-gray-200 text-gray-500 hover:bg-gray-50'
          }`}
        >
          <School size={18} /> Student Donor
        </button>
      </div>

      <form onSubmit={handleSignup} className="space-y-4">

        {/* COMMON FIELDS */}
        <div>
          <label className="block text-sm font-bold text-gray-700">Full Name</label>
          <input
            type="text"
            name="fullName"
            required
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#8b0000] outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700">Email Address</label>
          <input
            type="email"
            name="email"
            required
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#8b0000] outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700">Password</label>
          <input
            type="password"
            name="password"
            required
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#8b0000] outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700">Phone Number</label>
          <input
            type="tel"
            name="phone"
            required
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#8b0000] outline-none"
          />
        </div>

        {/* BLOOD GROUP */}
        <div>
          <label className="block text-sm font-bold text-gray-700">Blood Group</label>
          <select
            name="bloodGroup"
            required
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#8b0000] outline-none bg-white"
          >
            <option value="">Select Group</option>
            {bloodGroups.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        {/* MAP SECTION */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-bold text-gray-700">
              Capture Your Location
            </label>

            <button
              type="button"
              onClick={getCurrentLocation}
              className="text-xs font-bold text-[#8b0000] flex items-center gap-1 hover:underline"
            >
              {locationLoading
                ? <Loader size={12} className="animate-spin" />
                : <Navigation size={12} />}
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

        {/* STUDENT FIELDS */}
        {userType === 'student' && (
          <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 space-y-4 animate-fade-in">
            <h3 className="text-sm font-bold text-indigo-900 flex items-center gap-2">
              <School size={16} /> Student Details
            </h3>

            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase">
                Select College
              </label>
              <select
                name="collegeName"
                required
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 outline-none bg-white"
              >
                <option value="">-- Choose your Campus --</option>
                {colleges.map(college => (
                  <option key={college._id} value={college.collegeName}>
                    {college.collegeName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase">
                Roll Number / ID
              </label>
              <input
                type="text"
                name="collegeId"
                placeholder="e.g. 21CSE102"
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isSigningUp}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-[#b30000] hover:bg-[#8b0000] disabled:opacity-70 transition transform hover:-translate-y-0.5"
        >
          {isSigningUp
            ? <Loader className="animate-spin" size={20} />
            : "Complete Registration"}
        </button>

      </form>
    </div>
  );

  const renderVerification = () => (
    <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-[#8b0000]">
          Verify Your Contact
        </h2>
        <p className="text-sm text-gray-600 mt-2">
          Security OTPs sent to your Email & Phone.
        </p>
      </div>

      {/* EMAIL OTP */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <label className="font-semibold text-gray-700">Email OTP</label>
          {verificationStatus.email && (
            <span className="text-green-600 flex items-center text-sm">
              <CheckCircle size={16} className="mr-1" /> Verified
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter 6-digit code"
            value={emailOtp}
            onChange={(e) => setEmailOtp(e.target.value)}
            disabled={verificationStatus.email}
            className="flex-1 px-3 py-2 border rounded-md focus:ring-[#8b0000] focus:border-[#8b0000] disabled:bg-gray-100"
          />

          <button
            onClick={() => handleVerify('email')}
            disabled={verificationStatus.email || isVerifying}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Verify
          </button>
        </div>
      </div>

      {/* PHONE OTP */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <label className="font-semibold text-gray-700">Phone OTP</label>
          {verificationStatus.phone && (
            <span className="text-green-600 flex items-center text-sm">
              <CheckCircle size={16} className="mr-1" /> Verified
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter 6-digit code"
            value={phoneOtp}
            onChange={(e) => setPhoneOtp(e.target.value)}
            disabled={verificationStatus.phone}
            className="flex-1 px-3 py-2 border rounded-md focus:ring-[#8b0000] focus:border-[#8b0000] disabled:bg-gray-100"
          />

          <button
            onClick={() => handleVerify('phone')}
            disabled={verificationStatus.phone || isVerifying}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Verify
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-[#ffeaea] p-8 text-center">
          <h2 className="text-3xl font-bold text-[#8b0000] mb-4">
            {step === 1 ? "Join the Network" : "Almost There!"}
          </h2>
          <p className="text-gray-700 mb-6">
            {step === 1
              ? "The blood you donate gives someone another chance at life."
              : "Security checks ensure a safe community for everyone."}
          </p>
        </div>

        {step === 1 ? renderForm() : renderVerification()}
      </div>
    </div>
  );
};

export default SignUpPage;
