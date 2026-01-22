import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Loader, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SignUpPage = () => {
  const navigate = useNavigate();
  const { signup, verifyOtp, isSigningUp, isVerifying } = useAuthStore();
  
  // UI State
  const [step, setStep] = useState(1); // 1 = Form, 2 = Verification
  const [userType, setUserType] = useState('individual');
  
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
  });

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // STEP 1: SUBMIT REGISTRATION
  const handleSignup = async (e) => {
    e.preventDefault();
    const user = await signup(formData);
    if (user) {
      setRegisteredEmail(user.email);
      setStep(2); // Move to OTP screen
    }
  };

  // STEP 2: VERIFY OTP
  const handleVerify = async (type) => {
    const otp = type === 'email' ? emailOtp : phoneOtp;
    if (!otp) return;

    const result = await verifyOtp(registeredEmail, otp, type);

    if (result === "SUCCESS") {
        // Fully verified
        navigate('/'); // Go to Dashboard
    } else if (result === "PARTIAL") {
        // Mark local state as verified
        setVerificationStatus(prev => ({ ...prev, [type]: true }));
    }
  };

  // --- RENDER HELPERS ---
  
  // RENDER STEP 1: The Registration Form
  const renderForm = () => (
    <div className="w-full md:w-1/2 p-8">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Create Account</h2>
      
      {/* Type Toggle */}
      <div className="flex justify-center mb-6 bg-gray-100 p-1 rounded-lg">
         <button onClick={() => setUserType('individual')} className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition ${userType === 'individual' ? 'bg-[#8b0000] text-white shadow' : 'text-gray-600 hover:bg-gray-200'}`}>Individual</button>
         <button onClick={() => setUserType('college')} className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition ${userType === 'college' ? 'bg-[#8b0000] text-white shadow' : 'text-gray-600 hover:bg-gray-200'}`}>College</button>
      </div>

      <form onSubmit={handleSignup} className="space-y-4">
        <div>
           <label className="block text-sm font-medium text-gray-700">Full Name</label>
           <input type="text" name="fullName" required onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#8b0000] focus:border-[#8b0000]" />
        </div>
        <div>
           <label className="block text-sm font-medium text-gray-700">Email Address</label>
           <input type="email" name="email" required onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#8b0000] focus:border-[#8b0000]" />
        </div>
        <div>
           <label className="block text-sm font-medium text-gray-700">Password</label>
           <input type="password" name="password" required onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#8b0000] focus:border-[#8b0000]" />
        </div>
        <div>
           <label className="block text-sm font-medium text-gray-700">Phone Number</label>
           <input type="tel" name="phone" required onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#8b0000] focus:border-[#8b0000]" />
        </div>

        {userType === 'individual' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
               <label className="block text-sm font-medium text-gray-700">Blood Group</label>
               <select name="bloodGroup" required onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#8b0000]">
                 <option value="">Select</option>
                 {bloodGroups.map(g => <option key={g} value={g}>{g}</option>)}
               </select>
            </div>
            <div>
               <label className="block text-sm font-medium text-gray-700">City</label>
               <input type="text" name="location" onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#8b0000]" />
            </div>
          </div>
        )}

        {userType === 'college' && (
           <>
             <div>
               <label className="block text-sm font-medium text-gray-700">College Name</label>
               <input type="text" name="collegeName" onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#8b0000]" />
             </div>
             <div>
               <label className="block text-sm font-medium text-gray-700">College ID / Roll No</label>
               <input type="text" name="collegeId" onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#8b0000]" />
             </div>
           </>
        )}

        <button type="submit" disabled={isSigningUp} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#b30000] hover:bg-[#8b0000] disabled:opacity-50">
          {isSigningUp ? <Loader className="animate-spin" size={20} /> : "Create Account"}
        </button>
      </form>
    </div>
  );

  // RENDER STEP 2: The OTP Screen
  const renderVerification = () => (
    <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-[#8b0000]">Verify Your Contact</h2>
        <p className="text-sm text-gray-600 mt-2">
            We have sent OTPs to your Email and Phone. <br/>
            <span className="font-mono text-xs bg-gray-100 p-1 rounded">(Check Backend Console for codes)</span>
        </p>
      </div>

      {/* Email Verification */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex justify-between items-center mb-2">
            <label className="font-semibold text-gray-700">Email OTP</label>
            {verificationStatus.email && <span className="text-green-600 flex items-center text-sm"><CheckCircle size={16} className="mr-1"/> Verified</span>}
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

      {/* Phone Verification */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex justify-between items-center mb-2">
            <label className="font-semibold text-gray-700">Phone OTP</label>
            {verificationStatus.phone && <span className="text-green-600 flex items-center text-sm"><CheckCircle size={16} className="mr-1"/> Verified</span>}
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

      {isVerifying && <p className="text-center text-sm text-gray-500 animate-pulse">Verifying...</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full bg-white rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row">
        
        {/* LEFT SIDE: Graphics */}
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

        {/* RIGHT SIDE: Dynamic Content */}
        {step === 1 ? renderForm() : renderVerification()}

      </div>
    </div>
  );
};

export default SignUpPage;