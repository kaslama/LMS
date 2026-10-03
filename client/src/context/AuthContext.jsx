import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { getErrorMessage } from '../utils/errorHandler';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is logged in on mount
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/login', { email, password });
      setUser(response.data);
      localStorage.setItem('userInfo', JSON.stringify(response.data));
      setLoading(false);
      return response.data;
    } catch (err) {
      setError(getErrorMessage(err));
      setLoading(false);
      throw err;
    }
  };

  const register = async (name, email, password, role) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
        role,
      });
      setUser(response.data);
      localStorage.setItem('userInfo', JSON.stringify(response.data));
      setLoading(false);
      return response.data;
    } catch (err) {
      setError(getErrorMessage(err));
      setLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    try {
      // Tells the backend to clear the HTTP-only cookie
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // 1. Clear React state
      setUser(null);
      
      // 2. Wipe Local Storage completely
      localStorage.removeItem('userInfo');
      localStorage.removeItem('token'); 
      
      // 3. Clear Axios headers so the next user doesn't accidentally use the old token
      if (api.defaults.headers) {
        delete api.defaults.headers.common['Authorization'];
      }
      
      // 4. Hard redirect to flush React's memory
      window.location.href = '/login';
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};