import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Menu, X, Droplet, User, LogOut, Building2 } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { authUser, logout } = useAuthStore();
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? "text-[#b30000] font-bold" : "text-gray-600 hover:text-[#b30000]";

  // Helper to close menu when a link is clicked
  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0" onClick={closeMenu}>
            <Droplet className="h-8 w-8 text-[#b30000] fill-current" />
            <span className="font-bold text-2xl text-gray-900 tracking-tight">
              Blood<span className="text-[#b30000]">Link</span>
            </span>
          </Link>

          {/* DESKTOP LINKS & AUTH */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-6">
                <Link to="/" className={isActive('/')}>Home</Link>
                <Link to="/about" className={isActive('/about')}>About Us</Link>
                <Link to="/centers" className={isActive('/centers')}>Blood Centers</Link>
            </div>

            {!authUser ? (
              <div className="flex items-center gap-6">
                <Link to="/college/login" className="text-gray-600 hover:text-[#b30000] font-medium flex items-center gap-2">
                  <Building2 size={18} /> College Login
                </Link>
                <Link to="/login" className="text-gray-600 hover:text-[#b30000] font-bold">
                  Login
                </Link>
                <Link to="/signup" className="bg-[#b30000] text-white px-5 py-2.5 rounded-full font-bold hover:bg-red-800 transition shadow-md hover:shadow-lg">
                  Donate Now
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-[#b30000] font-bold">
                        {authUser.fullName?.[0] || <User size={18} />}
                    </div>
                    <span className="font-medium text-gray-700 hidden lg:block">
                        {authUser.fullName?.split(' ')[0]}
                    </span>
                </div>
                <button onClick={logout} className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition">
                    <LogOut size={20} />
                    <span className="hidden lg:inline">Logout</span>
                </button>
              </div>
            )}
          </div>

          {/* MOBILE MENU BUTTON */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700 p-2">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* === MOBILE MENU (UPDATED) === */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 p-4 space-y-4 shadow-xl absolute w-full left-0 z-50">
          <Link to="/" onClick={closeMenu} className="block text-gray-700 font-medium">Home</Link>
          <Link to="/about" onClick={closeMenu} className="block text-gray-700 font-medium">About Us</Link>
          <Link to="/centers" onClick={closeMenu} className="block text-gray-700 font-medium">Blood Centers</Link>
          
          <div className="border-t border-gray-100 pt-4 space-y-3">
            {!authUser ? (
              <>
                 <Link to="/college/login" onClick={closeMenu} className="flex items-center gap-2 text-gray-600 font-medium">
                    <Building2 size={18} /> College Login
                 </Link>
                 <Link to="/login" onClick={closeMenu} className="block text-gray-600 font-bold">
                    Login
                 </Link>
                 <Link to="/signup" onClick={closeMenu} className="block w-full text-center bg-[#b30000] text-white py-3 rounded-xl font-bold">
                    Donate Now
                 </Link>
              </>
            ) : (
              /* === LOGGED IN MOBILE VIEW === */
              <>
                 <div className="flex items-center gap-3 bg-red-50 p-3 rounded-lg">
                     <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#b30000] font-bold shadow-sm">
                        {authUser.fullName?.[0]}
                     </div>
                     <div>
                        <p className="text-sm font-bold text-gray-900">{authUser.fullName}</p>
                        <p className="text-xs text-gray-500">{authUser.email}</p>
                     </div>
                 </div>
                 
                 <button 
                    onClick={() => { logout(); closeMenu(); }} 
                    className="w-full flex items-center gap-2 text-red-600 font-bold py-2"
                 >
                    <LogOut size={20} /> Logout
                 </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;