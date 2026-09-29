import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../ui/Spinner';

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner size="lg" />
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check role authorization
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect based on actual role if they try to access unauthorized area
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'instructor') return <Navigate to="/instructor/dashboard" replace />;
    return <Navigate to="/student/dashboard" replace />;
  }

  // Authorized
  return <Outlet />;
};

export default ProtectedRoute;