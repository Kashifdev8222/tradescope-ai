import { apiClient } from './client';
import type { LeaderboardFilter, TraderActivity } from '@tradescope/shared-types';

export async function getLeaderboard(filters: LeaderboardFilter = {}) {
  const res = await apiClient.get('/leaderboard', { params: filters });
  return res.data;
}

export async function getActivityFeed(limit = 50): Promise<TraderActivity[]> {
  const res = await apiClient.get('/leaderboard/activity', { params: { limit } });
  return res.data.data;
}
