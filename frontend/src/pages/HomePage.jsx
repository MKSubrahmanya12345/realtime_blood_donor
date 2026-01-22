import React from 'react';
import { useAuthStore } from '../store/useAuthStore';

const HomePage = () => {
  const { authUser } = useAuthStore();

  return (
    <div className="p-10 text-center">
       <h1 className="text-3xl font-bold text-green-700">Welcome back, {authUser?.fullName}!</h1>
       <p className="mt-4 text-gray-600">You are now logged in.</p>
       
       {/* Future Dashboard Widgets go here */}
       <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 bg-blue-50 rounded-lg border border-blue-100">
             <h3 className="font-bold text-blue-800">Your Last Donation</h3>
             <p className="text-sm text-gray-600">No records found.</p>
          </div>
          <div className="p-6 bg-green-50 rounded-lg border border-green-100">
             <h3 className="font-bold text-green-800">Donor Status</h3>
             <p className="text-sm text-gray-600">Active</p>
          </div>
       </div>
    </div>
  );
};

export default HomePage;