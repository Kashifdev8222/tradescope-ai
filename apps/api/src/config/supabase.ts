import { createClient } from '@supabase/supabase-js';
import { config } from './index.js';

// Service role client for backend operations (bypasses RLS)
export const supabaseAdmin = createClient(config.supabase.url, config.supabase.serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Standard client for auth operations
export const supabaseAuth = createClient(config.supabase.url, config.supabase.anonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
