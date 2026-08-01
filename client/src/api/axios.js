import axios from 'axios';
import { store } from '../store/store';
import { logout } from '../store/authSlice';

import config from '../config/env';

const api = axios.create({
  baseURL: `${config.apiUrl}/api`,
  withCredentials: true,
});

// Request Interceptor to attach Bearer token (Fixes Vercel/Render third-party cookie blocking)
api.interceptors.request.use((config) => {
  const adminInfo = localStorage.getItem('adminInfo');
  if (adminInfo) {
    try {
      const { token } = JSON.parse(adminInfo);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error('Failed to parse adminInfo from localStorage');
    }
  }
  return config;
});

// Response Interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized globally (Token expiration or missing token)
    if (error.response && error.response.status === 401) {
      console.warn('Unauthorized access - logging out.');
      // Dispatch logout action to clear Redux state and local storage
      store.dispatch(logout());

    }

    // Pass the error down so RTK Query can catch it
    return Promise.reject(error);
  }
);


export default api;
