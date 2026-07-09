import { apiClient } from './client';

export async function getNewsFeed(source?: string, limit = 20) {
  const res = await apiClient.get('/news', { params: { source, limit } });
  return res.data.data;
}
