import { supabaseAdmin, supabaseAuth } from '../../config/supabase.js';
import type { LoginRequest, RegisterRequest, AuthResponse } from '@tradescope/shared-types';

export async function register(input: RegisterRequest): Promise<AuthResponse> {
  const { data, error } = await supabaseAuth.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        display_name: input.display_name || input.email.split('@')[0],
        phone: input.phone || '',
      },
    },
  });

  if (error) {
    console.error('[Auth] SignUp error:', JSON.stringify(error));
    if (error.message?.includes('already registered') || error.message?.includes('already exists')) {
      throw Object.assign(new Error('Email already registered'), { code: 'EMAIL_EXISTS' });
    }
    throw new Error(error.message || 'Registration failed');
  }

  if (!data.user) {
    throw new Error('Registration failed - no user returned');
  }

  // If session exists, user was auto-confirmed — fetch the profile trigger created
  // If no session, email confirmation is required
  if (!data.session) {
    throw Object.assign(
      new Error('Email confirmation required. Please check your inbox or enable auto-confirm in Supabase.'),
      { code: 'EMAIL_CONFIRMATION_REQUIRED' },
    );
  }

  // Fetch the profile created by the database trigger
  const { data: profile, error: profileErr } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  if (profileErr) {
    console.error('[Auth] Profile fetch error:', profileErr.message);
    console.error('[Auth] Did you run the migration SQL? The profiles table may not exist.');
    throw new Error('Database setup incomplete — run the migration SQL in Supabase SQL Editor');
  }

  if (!profile) {
    throw new Error('Profile creation failed');
  }

  return {
    user: profile,
    session: {
      access_token: data.session?.access_token || '',
      refresh_token: data.session?.refresh_token || '',
      expires_at: data.session?.expires_at || 0,
    },
  };
}

export async function login(input: LoginRequest): Promise<AuthResponse> {
  const { data, error } = await supabaseAuth.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });

  if (error) {
    throw Object.assign(new Error('Invalid email or password'), { code: 'INVALID_CREDENTIALS' });
  }

  if (!data.user || !data.session) {
    throw Object.assign(new Error('Invalid email or password'), { code: 'INVALID_CREDENTIALS' });
  }

  // Check if user is active
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  if (!profile) {
    throw new Error('User profile not found');
  }

  if (!profile.is_active) {
    throw Object.assign(new Error('Your account has been suspended'), { code: 'ACCOUNT_SUSPENDED' });
  }

  return {
    user: profile,
    session: {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at || 0,
    },
  };
}

export async function forgotPassword(email: string): Promise<void> {
  const { error } = await supabaseAuth.auth.resetPasswordForEmail(email, {
    redirectTo: process.env.RESET_PASSWORD_REDIRECT || 'http://localhost:5173/reset-password',
  });
  // Don't reveal if email exists - always return success
  if (error) {
    console.warn('Password reset error:', error.message);
  }
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  // Supabase handles token verification via the link they sent
  const { error } = await supabaseAuth.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    throw new Error('Password reset failed. The link may have expired.');
  }
}
