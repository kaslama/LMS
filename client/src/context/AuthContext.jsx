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
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      localStorage.removeItem('userInfo');
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