import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = ({ hideLinks = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user, logout } = useContext(AuthContext);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-navy-900 text-white px-3 py-2 rounded-lg font-bold text-xl">HM</div>
            <span className="hidden md:inline font-bold text-navy-900 text-xl">HireMe</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {!hideLinks && (
              <>
                {!isAuthenticated ? (
                  <>
                    <Link to="/" className="text-gray-600 hover:text-navy-900 transition">
                      Home
                    </Link>
                    <a href="/#about" className="text-gray-600 hover:text-navy-900 transition">
                      About
                    </a>
                  </>
                ) : (
                  <>
                    <span className="text-gray-400 cursor-not-allowed">
                      Home
                    </span>
                    <span className="text-gray-400 cursor-not-allowed">
                      About
                    </span>
                  </>
                )}
              </>
            )}
            {!isAuthenticated ? (
              <>
                {!hideLinks && (
                  <Link to="/login" className="text-gray-600 hover:text-navy-900 transition">
                    Login
                  </Link>
                )}
                <Link to="/register?role=worker" className="btn-primary">
                  Get Started
                </Link>
              </>
            ) : (
              <>
                <span className="text-gray-600">
                  Welcome, {user?.name || 'User'}
                </span>
                <Link
                  to={user?.role === 'worker' ? '/worker/dashboard' : '/employer/dashboard'}
                  className="text-navy-900 hover:text-navy-800 font-semibold"
                >
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="btn-secondary"
                >
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-navy-900"
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-4">
            {!hideLinks && (
              <>
                {!isAuthenticated ? (
                  <>
                    <Link to="/" className="block text-gray-600 hover:text-navy-900">
                      Home
                    </Link>
                    <a href="/#about" className="block text-gray-600 hover:text-navy-900">
                      About
                    </a>
                  </>
                ) : (
                  <>
                    <span className="block text-gray-400 cursor-not-allowed">
                      Home
                    </span>
                    <span className="block text-gray-400 cursor-not-allowed">
                      About
                    </span>
                  </>
                )}
              </>
            )}
            {!isAuthenticated ? (
              <>
                {!hideLinks && (
                  <Link to="/login" className="block text-gray-600 hover:text-navy-900">
                    Login
                  </Link>
                )}
                <Link to="/register?role=worker" className="block btn-primary text-center">
                  Get Started
                </Link>
              </>
            ) : (
              <>
                <span className="block text-gray-600">
                  Welcome, {user?.name || 'User'}
                </span>
                <Link
                  to={user?.role === 'worker' ? '/worker/dashboard' : '/employer/dashboard'}
                  className="block text-navy-900 font-semibold"
                >
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="block w-full btn-secondary text-center"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};


export default Navbar;
