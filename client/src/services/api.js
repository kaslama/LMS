import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// Request interceptor to add the auth token header to requests
api.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const { token } = JSON.parse(userInfo);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration/401s
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if the request was specifically for the login route
    const isLoginRequest = error.config && error.config.url && error.config.url.includes('/auth/login');
    
    // Only force a reload if it's a 401 AND it's NOT the login request
    if (error.response && error.response.status === 401 && !isLoginRequest) {
      localStorage.removeItem('userInfo');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;