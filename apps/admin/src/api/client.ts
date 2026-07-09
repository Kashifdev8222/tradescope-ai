import axios from 'axios';
import { API_BASE_URL } from '../lib/constants';
import { supabase } from '../lib/supabase';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (r) => r,
  async (error) => {
    const url = error.config?.url || '';
    const isAuthEndpoint = url.includes('/auth/');
    if (error.response?.status === 401 && !isAuthEndpoint) {
      await supabase.auth.signOut();
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  },
);
