import React, { useState } from 'react';
import { axiosInstance } from '../lib/axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Activity } from 'lucide-react';

const RequestBloodPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    patientName: '',
    bloodGroup: '',
    unitsRequired: 1,
    hospitalName: '',
    location: '',
    urgency: 'Medium',
    contactNumber: '',
    note: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/requests/create', formData);
      toast.success("Blood Request Posted! Donors will be notified.");
      navigate('/');
    } catch (error) {
      toast.error("Failed to post request.");
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
            <label className="label">Patient Name</label>
            <input type="text" required className="input-field" 
              onChange={(e) => setFormData({...formData, patientName: e.target.value})} 
            />
          </div>

          {/* Blood Group */}
          <div>
             <label className="label">Blood Group Needed</label>
             <select className="input-field" required onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})}>
               <option value="">Select</option>
               {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => <option key={g} value={g}>{g}</option>)}
             </select>
          </div>

          {/* Units */}
          <div>
             <label className="label">Units Required</label>
             <input type="number" min="1" required className="input-field"
               onChange={(e) => setFormData({...formData, unitsRequired: e.target.value})} 
             />
          </div>

          {/* Urgency */}
          <div className="md:col-span-2">
             <label className="label">Urgency Level</label>
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
             <label className="label">Hospital Name</label>
             <input type="text" required className="input-field"
               onChange={(e) => setFormData({...formData, hospitalName: e.target.value})} 
             />
          </div>
          <div>
             <label className="label">City / Area</label>
             <input type="text" required className="input-field"
               onChange={(e) => setFormData({...formData, location: e.target.value})} 
             />
          </div>

          {/* Contact */}
          <div className="md:col-span-2">
             <label className="label">Contact Number</label>
             <input type="tel" required className="input-field"
               onChange={(e) => setFormData({...formData, contactNumber: e.target.value})} 
             />
          </div>

          <button type="submit" className="md:col-span-2 bg-[#b30000] text-white py-3 rounded-lg font-bold hover:bg-[#900000] transition mt-4">
             Post Emergency Request
          </button>
        </form>
      </div>
    </div>
  );
};

// CSS Helper (Add to index.css if needed, or inline classes)
// .input-field { @apply w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b30000] focus:border-transparent outline-none; }
// .label { @apply block text-sm font-medium text-gray-700 mb-1; }

export default RequestBloodPage;