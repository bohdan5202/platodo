import axios from 'axios';
import { useMemo } from 'react';
import { getToken, removeToken } from '../utils/auth';
import { router } from 'expo-router';

// In Expo, usually use local IP for Android emulator or device
// You can also read this from environment variables
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8000'; 

const useApi = () => {
  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    instance.interceptors.request.use(
      async (config) => {
        const token = await getToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response && error.response.status === 401) {
          await removeToken();
          router.replace('/login');
        }
        return Promise.reject(error);
      }
    );

    return instance;
  }, []);

  return api;
};

export default useApi;
