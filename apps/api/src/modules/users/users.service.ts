import { supabaseAdmin } from '../../config/supabase.js';
import type { UserProfile, AISettings } from '@tradescope/shared-types';

export async function getProfile(userId: string): Promise<UserProfile> {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) throw new Error('Profile not found');
  return data;
}

export async function updateProfile(
  userId: string,
  updates: { display_name?: string; avatar_url?: string },
): Promise<UserProfile> {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select('*')
    .single();

  if (error || !data) throw new Error('Failed to update profile');
  return data;
}

export async function getUserSettings(userId: string): Promise<{
  profile: UserProfile;
  aiSettings: AISettings | null;
}> {
  const [profileResult, aiResult] = await Promise.all([
    supabaseAdmin.from('profiles').select('*').eq('id', userId).single(),
    supabaseAdmin.from('ai_settings').select('*').eq('user_id', userId).single(),
  ]);

  if (profileResult.error || !profileResult.data) throw new Error('Profile not found');

  return {
    profile: profileResult.data,
    aiSettings: aiResult.data || null,
  };
}
