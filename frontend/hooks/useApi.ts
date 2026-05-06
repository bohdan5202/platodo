// hooks/useApi.ts
import axios from 'axios';
import { useMemo } from 'react';
import { getToken, removeToken } from '../utils/auth';

const useApi = () => {
  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Attach token from cookie on every request
    instance.interceptors.request.use(
      (config) => {
        const token = getToken(); // now reads cookie → always in sync
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Handle 401 — clear token then hard-navigate to /login
    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          removeToken(); // clears both cookie and localStorage

          if (typeof window !== 'undefined') {
            // Only redirect if not already on an auth page
            // This prevents the middleware bounce-loop:
            //   401 fires → we go to /login → middleware sees no cookie → /login ✅ (no loop)
            const isAuthPage =
              window.location.pathname.startsWith('/login') ||
              window.location.pathname.startsWith('/register') ||
              window.location.pathname.startsWith('/forgot-password') ||
              window.location.pathname.startsWith('/reset-password');

            if (!isAuthPage) {
              window.location.href = '/login';
            }
          }
        }
        return Promise.reject(error);
      }
    );

    return instance;
  }, []);

  return api;
};

export default useApi;