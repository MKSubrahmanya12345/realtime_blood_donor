import React from 'react';
import { Link } from 'react-router-dom';

const Bloodcenter = () => {
  return (
    <div className="min-h-screen bg-[#f4f6f8] font-sans pb-10">
      
      {/* Navbar/Header has been removed completely */}

      {/* ===== MAIN CONTAINER ===== */}
      <div className="w-[90%] max-w-[1100px] mx-auto mt-8 bg-white p-8 rounded-md shadow-lg">
        <h2 className="text-[#8b0000] text-2xl font-bold mb-6">Add Blood Centre</h2>

        <form>
          
          {/* --- Section 1: Address --- */}
          <div className="mb-8">
            <div className="bg-[#fbeaea] text-[#8b0000] font-bold p-3 rounded mb-4">
              Blood Bank Address
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold mb-1">State</label>
                <select className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-[#8b0000]">
                  <option>Select State</option>
                  <option>Maharashtra</option>
                  <option>Karnataka</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">District</label>
                <input type="text" placeholder="Enter district" className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-[#8b0000]" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">City</label>
                <input type="text" placeholder="Enter city" className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-[#8b0000]" />
              </div>
            </div>
          </div>

          {/* --- Section 2: Details --- */}
          <div className="mb-8">
            <div className="bg-[#fbeaea] text-[#8b0000] font-bold p-3 rounded mb-4">
              Blood Bank Details
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold mb-1">Blood Bank Name</label>
                <input type="text" placeholder="Enter blood bank name" className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-[#8b0000]" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Parent Hospital</label>
                <input type="text" placeholder="Enter hospital name" className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-[#8b0000]" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Contact Person</label>
                <input type="text" placeholder="Enter contact person" className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-[#8b0000]" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Email</label>
                <input type="email" placeholder="Enter email" className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-[#8b0000]" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Contact Number</label>
                <input type="tel" placeholder="Enter contact number" className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-[#8b0000]" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">License Number</label>
                <input type="text" placeholder="Enter license number" className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-[#8b0000]" />
              </div>
            </div>
          </div>

          {/* --- Section 3: Donation Type --- */}
          <div className="mb-8">
            <div className="bg-[#fbeaea] text-[#8b0000] font-bold p-3 rounded mb-4">
              Donation Type
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['Whole Blood', 'Apheresis', 'Plateletpheresis', 'Plasmapheresis'].map((item) => (
                <label key={item} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 cursor-pointer accent-[#8b0000]" />
                  {item}
                </label>
              ))}
            </div>
          </div>

          {/* --- Section 4: Component Type --- */}
          <div className="mb-8">
            <div className="bg-[#fbeaea] text-[#8b0000] font-bold p-3 rounded mb-4">
              Component Type
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['Packed Red Blood Cells', 'Fresh Frozen Plasma', 'Platelet Concentrate', 'Cryoprecipitate'].map((item) => (
                <label key={item} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 cursor-pointer accent-[#8b0000]" />
                  {item}
                </label>
              ))}
            </div>
          </div>

          {/* --- Actions --- */}
          <div className="text-right flex justify-end gap-3 mt-6">
            <button type="button" className="bg-[#555] hover:bg-[#333] text-white px-5 py-2.5 rounded text-sm font-medium transition-colors">
              Cancel
            </button>
            <button type="submit" className="bg-[#8b0000] hover:bg-[#a30000] text-white px-5 py-2.5 rounded text-sm font-medium transition-colors">
              Save
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default BloodCenter;

