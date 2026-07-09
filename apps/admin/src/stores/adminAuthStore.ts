import { create } from 'zustand';
import type { AuthUser } from '@tradescope/shared-types';
import { supabase } from '../lib/supabase';
import { apiClient } from '../api/client';

interface AdminAuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAdminAuthStore = create<AdminAuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  isAdmin: false,

  setUser: (user) => set({
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  }),

  setLoading: (isLoading) => set({ isLoading }),

  login: async (email, password) => {
    const res = await apiClient.post('/auth/login', { email, password });
    const result = res.data.data;
    if (result.session?.access_token) {
      await supabase.auth.setSession({
        access_token: result.session.access_token,
        refresh_token: result.session.refresh_token,
      });
    }
    if (result.user.role !== 'admin') {
      throw new Error('Access denied. Admin credentials required.');
    }
    set({
      user: { id: result.user.id, email: result.user.email, role: result.user.role, is_active: result.user.is_active },
      isAuthenticated: true,
      isAdmin: true,
    });
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, isAuthenticated: false, isAdmin: false });
  },
}));
