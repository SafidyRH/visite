import axios from 'axios';
import { supabase } from '../services/supabase-client';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // votre backend ou Supabase REST
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT à chaque requête
axiosInstance.interceptors.request.use(
  async (config) => {
    const { data } = await supabase.auth.getSession();
    const session = data?.session;
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;