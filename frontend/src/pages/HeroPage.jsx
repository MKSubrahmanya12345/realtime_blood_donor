import React from 'react';
import { useNavigate } from 'react-router-dom';
import bloodImg from '../assets/blood.jpg'; // Ensure this matches your path

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
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1 */}
          <div className="bg-white p-8 rounded-xl shadow-md hover:-translate-y-2 transition-transform duration-300 text-center">
            <h3 className="text-xl font-bold text-[#8b0000] mb-3">Find Blood</h3>
            <p className="text-gray-600 mb-6 text-sm">
              Check availability of blood groups in nearby blood banks.
            </p>
            <button 
              onClick={() => navigate('/blood-availability')}
              className="bg-[#b30000] text-white px-6 py-2 rounded-md hover:bg-[#8b0000] transition cursor-pointer"
            >
              Search Blood
            </button>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-8 rounded-xl shadow-md hover:-translate-y-2 transition-transform duration-300 text-center">
            <h3 className="text-xl font-bold text-[#8b0000] mb-3">Donate Blood</h3>
            <p className="text-gray-600 mb-6 text-sm">
              Register as a donor and help save precious lives.
            </p>
            <button 
              onClick={() => navigate('/signup')} 
              className="bg-[#b30000] text-white px-6 py-2 rounded-md hover:bg-[#8b0000] transition cursor-pointer"
            >
              Donate Now
            </button>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-8 rounded-xl shadow-md hover:-translate-y-2 transition-transform duration-300 text-center">
            <h3 className="text-xl font-bold text-[#8b0000] mb-3">Blood Centers</h3>
            <p className="text-gray-600 mb-6 text-sm">
              View a directory of registered blood banks and centers.
            </p>
            <button 
              onClick={() => navigate('/blood-centers')}
              className="bg-[#b30000] text-white px-6 py-2 rounded-md hover:bg-[#8b0000] transition cursor-pointer"
            >
              View Centers
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