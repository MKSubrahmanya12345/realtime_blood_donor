import React from 'react';
import { useNavigate } from 'react-router-dom';
import bloodImg from '../assets/blood.jpg'; 

const HeroPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      
      {/* HERO SECTION */}
      <section className="bg-[#ffeaea] py-20 px-5 text-center">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <h2 className="text-4xl font-bold text-[#8b0000] mb-4">
            Be a Life Saver ❤️
          </h2>
          <p className="text-lg text-gray-700 mb-8">
            Donate blood, save lives — your contribution matters.
          </p>
          
          <div className="rounded-xl overflow-hidden shadow-lg max-w-md w-full">
            <img 
              src={bloodImg} 
              alt="Blood Donation" 
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      </section>

      {/* ACTION CARDS */}
      <section className="py-12 px-4">
        {/* CHANGED: grid-cols-3 -> grid-cols-4 to fit the new card */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Find Blood */}
          <div className="bg-white p-6 rounded-xl shadow-md hover:-translate-y-2 transition-transform duration-300 text-center flex flex-col items-center">
            <h3 className="text-xl font-bold text-[#8b0000] mb-3">Find Blood</h3>
            <p className="text-gray-600 mb-6 text-sm flex-grow">
              Check availability of blood groups in nearby blood banks.
            </p>
            <button 
              onClick={() => navigate('/blood-centers')} // Adjusted to valid route
              className="bg-[#b30000] text-white px-6 py-2 rounded-md hover:bg-[#8b0000] transition cursor-pointer w-full"
            >
              Search Blood
            </button>
          </div>

          {/* Card 2: Donate Blood */}
          <div className="bg-white p-6 rounded-xl shadow-md hover:-translate-y-2 transition-transform duration-300 text-center flex flex-col items-center">
            <h3 className="text-xl font-bold text-[#8b0000] mb-3">Donate Blood</h3>
            <p className="text-gray-600 mb-6 text-sm flex-grow">
              Register as a donor and help save precious lives.
            </p>
            <button 
              onClick={() => navigate('/signup')} 
              className="bg-[#b30000] text-white px-6 py-2 rounded-md hover:bg-[#8b0000] transition cursor-pointer w-full"
            >
              Donate Now
            </button>
          </div>

          {/* Card 3: Blood Centers */}
          <div className="bg-white p-6 rounded-xl shadow-md hover:-translate-y-2 transition-transform duration-300 text-center flex flex-col items-center">
            <h3 className="text-xl font-bold text-[#8b0000] mb-3">Blood Centers</h3>
            <p className="text-gray-600 mb-6 text-sm flex-grow">
              Hospital Login for inventory and donor management.
            </p>
            <button 
              onClick={() => navigate('/hospital/login')}
              className="bg-[#b30000] text-white px-6 py-2 rounded-md hover:bg-[#8b0000] transition cursor-pointer w-full"
            >
              Hospital Login
            </button>
          </div>

          {/* Card 4: College Partner (NEW) */}
          <div className="bg-white p-6 rounded-xl shadow-md hover:-translate-y-2 transition-transform duration-300 text-center flex flex-col items-center border-2 border-indigo-100">
            <h3 className="text-xl font-bold text-indigo-900 mb-3">College Partner</h3>
            <p className="text-gray-600 mb-6 text-sm flex-grow">
              Organize drives and verify student donors on campus.
            </p>
            <button 
              onClick={() => navigate('/college/login')}
              className="bg-indigo-700 text-white px-6 py-2 rounded-md hover:bg-indigo-800 transition cursor-pointer w-full"
            >
              College Portal
            </button>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#333] text-white p-4 text-center mt-12 text-sm">
        <p>© 2026 Blood Bank Management System | Academic Project</p>
      </footer>

    </div>
  );
};

export default HeroPage;