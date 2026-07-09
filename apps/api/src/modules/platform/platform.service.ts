import { supabaseAdmin } from '../../config/supabase.js';
import type { PlatformSettings } from '@tradescope/shared-types';

export async function getAllSettings(): Promise<PlatformSettings[]> {
  const { data, error } = await supabaseAdmin
    .from('platform_settings')
    .select('*')
    .order('key');

  if (error) throw error;
  return data || [];
}

export async function getSetting(key: string): Promise<PlatformSettings> {
  const { data, error } = await supabaseAdmin
    .from('platform_settings')
    .select('*')
    .eq('key', key)
    .single();

  if (error || !data) throw new Error('Setting not found');
  return data;
}

export async function updateSetting(key: string, userId: string, value: any): Promise<PlatformSettings> {
  const { data, error } = await supabaseAdmin
    .from('platform_settings')
    .update({
      value,
      updated_by: userId,
      updated_at: new Date().toISOString(),
    })
    .eq('key', key)
    .select('*')
    .single();

  if (error || !data) throw new Error('Failed to update setting');

  // Log action
  await supabaseAdmin.from('admin_actions').insert({
    admin_id: userId,
    action_type: 'platform_setting_change',
    details: { key, value },
  });

  return data;
}
