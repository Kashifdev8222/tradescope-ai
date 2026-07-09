import { create } from 'zustand';
import type { AuthUser } from '@tradescope/shared-types';
import { supabase } from '../lib/supabase';
import * as authApi from '../api/auth';

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName?: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  setLoading: (isLoading) => set({ isLoading }),

  login: async (email, password) => {
    const result = await authApi.login({ email, password });
    // Store session in Supabase client
    if (result.session?.access_token) {
      await supabase.auth.setSession({
        access_token: result.session.access_token,
        refresh_token: result.session.refresh_token,
      });
    }
    set({
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        is_active: result.user.is_active,
      },
      isAuthenticated: true,
    });
  },

  register: async (email, password, displayName, phone) => {
    const result = await authApi.register({ email, password, display_name: displayName, phone });
    if (result.session?.access_token) {
      await supabase.auth.setSession({
        access_token: result.session.access_token,
        refresh_token: result.session.refresh_token,
      });
    }
    set({
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        is_active: result.user.is_active,
      },
      isAuthenticated: true,
    });
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, isAuthenticated: false });
  },
}));
