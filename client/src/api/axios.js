import axios from 'axios';
import { store } from '../store/store';
import { logout, userLogout } from '../store/authSlice';
import config from '../config/env';

const api = axios.create({
  baseURL: `${config.apiUrl}/api`,
  withCredentials: true,
});

// Request Interceptor to attach Bearer token (Fixes Vercel/Render third-party cookie blocking)
api.interceptors.request.use((reqConfig) => {
  let token = null;

  const adminInfo = localStorage.getItem('adminInfo');
  const userInfo = localStorage.getItem('userInfo');

  if (reqConfig.url?.startsWith('/admin') && adminInfo) {
    try {
      token = JSON.parse(adminInfo)?.token;
    } catch (e) {}
  } else if (userInfo) {
    try {
      token = JSON.parse(userInfo)?.token;
    } catch (e) {}
  }

  // Fallback: if not set yet, check adminInfo
  if (!token && adminInfo) {
    try {
      token = JSON.parse(adminInfo)?.token;
    } catch (e) {}
  }

  if (token) {
    reqConfig.headers.Authorization = `Bearer ${token}`;
  }

  return reqConfig;
});

// Response Interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized globally
    if (error.response && error.response.status === 401) {
      const isUserRoute = error.config?.url?.startsWith('/users');
      const isAdminRoute = error.config?.url?.startsWith('/admin');

      if (isUserRoute) {
        console.warn('User unauthorized - logging out user.');
        store.dispatch(userLogout());
      } else if (isAdminRoute) {
        console.warn('Admin unauthorized - logging out admin.');
        store.dispatch(logout());
      }
    }

    return Promise.reject(error);
  }
);

export default api;
