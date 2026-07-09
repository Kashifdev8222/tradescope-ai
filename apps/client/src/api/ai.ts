import { apiClient } from './client';
import type { AISettings, UpdateAISettingsRequest, AIAnalysis } from '@tradescope/shared-types';

export async function getAISettings(): Promise<AISettings> {
  const res = await apiClient.get('/ai/settings');
  return res.data.data;
}

export async function updateAISettings(data: UpdateAISettingsRequest): Promise<AISettings> {
  const res = await apiClient.patch('/ai/settings', data);
  return res.data.data;
}

export async function getAISignals(filters: { status?: string; page?: number; limit?: number } = {}) {
  const res = await apiClient.get('/ai/signals', { params: filters });
  return res.data;
}

export async function requestAnalysis(symbol: string, accountId: string): Promise<AIAnalysis> {
  const res = await apiClient.post('/ai/analyze', { symbol, account_id: accountId });
  return res.data.data;
}
