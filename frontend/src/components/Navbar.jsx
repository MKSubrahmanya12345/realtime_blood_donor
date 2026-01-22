import React from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, Droplet, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { authUser, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(false); // Mobile menu state

  const handleLogout = () => {
    logout();
    navigate('/'); // Redirect to landing page
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-[#b30000] p-2 rounded-full">
               <Droplet className="w-5 h-5 text-white" fill="currentColor" />
            </div>
            <span className="font-bold text-xl text-gray-800 tracking-tight">
              Blood<span className="text-[#b30000]">Link</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-600 hover:text-[#b30000] transition">Home</Link>
            <Link to="/about" className="text-gray-600 hover:text-[#b30000] transition">About Us</Link>
            
            {authUser ? (
              // === SHOW THIS IF LOGGED IN ===
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2 bg-red-50 px-3 py-1.5 rounded-full">
                    <User size={18} className="text-[#b30000]" />
                    <span className="text-sm font-semibold text-[#b30000]">
                      {authUser.fullName.split(' ')[0]} {/* First Name only */}
                    </span>
                 </div>
                 <button 
                   onClick={handleLogout}
                   className="flex items-center gap-2 text-gray-600 hover:text-[#b30000] transition font-medium"
                 >
                   <LogOut size={20} />
                   <span>Logout</span>
                 </button>
              </div>
            ) : (
              // === SHOW THIS IF GUEST ===
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-gray-700 font-medium hover:text-[#b30000]">
                  Login
                </Link>
                <Link to="/signup" className="bg-[#b30000] text-white px-5 py-2 rounded-full font-medium hover:bg-[#8b0000] transition shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                  Donate Now
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
             <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600">
               {isOpen ? <X size={28} /> : <Menu size={28} />}
             </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu Dropdown (Optional) */}
      {isOpen && (
        <div className="md:hidden bg-white border-t p-4 space-y-4">
           {authUser ? (
             <>
               <p className="font-bold text-[#b30000]">Hello, {authUser.fullName}</p>
               <button onClick={handleLogout} className="block w-full text-left text-gray-600">Logout</button>
             </>
           ) : (
             <>
               <Link to="/login" className="block text-gray-600">Login</Link>
               <Link to="/signup" className="block text-[#b30000] font-bold">Donate Now</Link>
             </>
           )}
        </div>
      )}
    </header>
  );
};

export default Navbar;