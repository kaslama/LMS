import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, Menu, X, User, LogOut, LayoutDashboard, 
  GraduationCap, Presentation, Shield 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'instructor') return '/instructor/dashboard';
    return '/student/dashboard';
  };

  // Helper function to render the correct icon based on role
  const renderRoleIcon = (role, className = "h-8 w-8") => {
    switch (role) {
      case 'student':
        return <GraduationCap className={`${className} text-blue-600 bg-blue-50 p-1 rounded-full border border-blue-200`} />;
      case 'instructor':
        return <Presentation className={`${className} text-green-600 bg-green-50 p-1 rounded-full border border-green-200`} />;
      case 'admin':
        return <Shield className={`${className} text-red-600 bg-red-50 p-1 rounded-full border border-red-200`} />;
      default:
        return <User className={`${className} text-gray-600 bg-gray-50 p-1 rounded-full border border-gray-200`} />;
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Logo routes to the appropriate dashboard if logged in */}
            <Link to={getDashboardLink()} className="flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="font-bold text-xl text-gray-900 tracking-tight">MERN LMS</span>
            </Link>
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              <Link to="/courses" className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
                Browse Courses
              </Link>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {!user ? (
              <>
                <Link to="/login" className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
                  Log in
                </Link>
                <Link to="/register" className="btn-primary">
                  Sign up
                </Link>
              </>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 focus:outline-none hover:bg-gray-50 p-1 rounded-md transition-colors"
                >
                  {renderRoleIcon(user.role)}
                  <span className="text-sm font-medium text-gray-700">{user.name}</span>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm text-gray-500">Signed in as</p>
                      <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                    </div>
                    <Link
                      to={getDashboardLink()}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                    {/* Routes dynamically to the specific role's profile page */}
                    <Link
                      to={`/${user.role}/profile`}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
            >
              {isMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-200">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/courses"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-blue-500 hover:text-blue-700"
              onClick={() => setIsMenuOpen(false)}
            >
              Browse Courses
            </Link>
          </div>
          {!user ? (
            <div className="pt-4 pb-3 border-t border-gray-200 space-y-1">
              <Link
                to="/login"
                className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-blue-700"
                onClick={() => setIsMenuOpen(false)}
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-blue-700"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign up
              </Link>
            </div>
          ) : (
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  {renderRoleIcon(user.role, "h-10 w-10")}
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">{user.name}</div>
                  <div className="text-sm font-medium text-gray-500">{user.email}</div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <Link
                  to={getDashboardLink()}
                  className="block px-4 py-2 text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                {/* Routes dynamically to the specific role's profile page in mobile menu */}
                <Link
                  to={`/${user.role}/profile`}
                  className="block px-4 py-2 text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-red-600 hover:text-red-800 hover:bg-gray-100"
                >
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;