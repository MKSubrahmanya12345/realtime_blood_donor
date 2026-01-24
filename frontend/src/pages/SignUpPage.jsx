import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { axiosInstance } from '../lib/axios';
import { Loader, CheckCircle, MapPin, School, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

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
    location: '',
    collegeName: '',
    collegeId: '',
    address: '',
    latitude: '',
    longitude: ''
  });

  const [locationLoading, setLocationLoading] = useState(false);

  // === FETCH COLLEGES ON LOAD ===
  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const res = await axiosInstance.get('/college/all');
        setColleges(res.data);
      } catch (error) {
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
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }));
          toast.success("Location fetched!");
          setLocationLoading(false);
        },
        () => {
          toast.error("Could not get location. Allow permissions.");
          setLocationLoading(false);
        }
      );
    } else {
      toast.error("GPS not supported");
      setLocationLoading(false);
    }
  };

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // === STEP 1: SUBMIT REGISTRATION ===
  const handleSignup = async (e) => {
    e.preventDefault();

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
  const handleVerify = async (type) => {
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
    <div className="w-full md:w-1/2 p-8">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Create Donor Account
      </h2>

      {/* TOGGLE: General vs Student */}
      <div className="flex justify-center gap-4 mb-6">
        <button
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
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#8b0000] focus:border-[#8b0000] outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700">Email Address</label>
          <input
            type="email"
            name="email"
            required
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#8b0000] focus:border-[#8b0000] outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700">Password</label>
          <input
            type="password"
            name="password"
            required
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#8b0000] focus:border-[#8b0000] outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700">Phone Number</label>
          <input
            type="tel"
            name="phone"
            required
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#8b0000] focus:border-[#8b0000] outline-none"
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

        {/* LOCATION */}
        <div>
          <label className="block text-sm font-bold text-gray-700">Current Location</label>
          <div className="space-y-2 mt-1">
            <input
              type="text"
              name="address"
              placeholder="City / Area / Hostel Name"
              required
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#8b0000] outline-none"
            />

            <button
              type="button"
              onClick={getCurrentLocation}
              className={`w-full flex items-center justify-center gap-2 py-2 border rounded-lg transition font-medium ${
                formData.latitude
                  ? 'bg-green-50 border-green-500 text-green-700'
                  : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {locationLoading
                ? <Loader size={16} className="animate-spin" />
                : <MapPin size={16} />}
              {formData.latitude
                ? "GPS Captured Successfully ✅"
                : "Auto-Detect My GPS"}
            </button>
          </div>
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
