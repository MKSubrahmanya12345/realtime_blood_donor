import React from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, Droplet, Menu, X, Building2, School } from 'lucide-react';

const Navbar = () => {
  const { authUser, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  // === SAFE DISPLAY NAME HELPER ===
  const getDisplayName = () => {
    if (!authUser) return "User";

    if (authUser.role === "college") {
      return authUser.collegeName || authUser.fullName || "College";
    }

    return authUser.fullName?.split(" ")[0] || "User";
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
            <Link to="/" className="text-gray-600 hover:text-[#b30000] transition">
              Home
            </Link>

            <Link to="/about" className="text-gray-600 hover:text-[#b30000] transition">
              About Us
            </Link>

            <Link
              to="/blood-centers"
              className="flex items-center gap-1 text-gray-600 hover:text-blue-700 font-medium transition"
            >
              <Building2 size={18} />
              Blood Centers
            </Link>

            {authUser ? (
              <div className="flex items-center gap-4">

                {/* ROLE-AWARE USER CHIP */}
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
                    authUser.role === 'college'
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'bg-red-50 text-[#b30000]'
                  }`}
                >
                  {authUser.role === 'college'
                    ? <School size={18} />
                    : <User size={18} />
                  }

                  <span className="text-sm font-semibold">
                    {getDisplayName()}
                  </span>
                </div>

                {/* LOGOUT */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-gray-600 hover:text-[#b30000] transition font-medium"
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>

              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-[#b30000] transition"
                >
                  Login
                </Link>

                <Link
                  to="/signup"
                  className="bg-[#b30000] text-white px-5 py-2 rounded-full hover:bg-[#8b0000] transition"
                >
                  Donate Now
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-600"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>

        </div>
      </div>

      {/* === MOBILE MENU === */}
      {isOpen && (
        <div className="md:hidden bg-white border-t p-4 space-y-4">

          {/* Core Nav Links */}
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="block text-gray-700"
          >
            Home
          </Link>

          <Link
            to="/about"
            onClick={() => setIsOpen(false)}
            className="block text-gray-700"
          >
            About Us
          </Link>

          <Link
            to="/blood-centers"
            onClick={() => setIsOpen(false)}
            className="block text-gray-700"
          >
            Blood Centers
          </Link>

          {authUser ? (
            <>
              {/* ROLE-SAFE GREETING */}
              <p className="font-bold text-[#b30000]">
                Hello, {getDisplayName()}
              </p>

              <button
                onClick={handleLogout}
                className="block w-full text-left text-gray-600"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="block text-gray-600"
              >
                Login
              </Link>

              <Link
                to="/signup"
                onClick={() => setIsOpen(false)}
                className="block text-[#b30000] font-bold"
              >
                Donate Now
              </Link>
            </>
          )}

        </div>
      )}
    </header>
  );
};

export default Navbar;
