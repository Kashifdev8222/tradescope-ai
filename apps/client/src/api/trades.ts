import { apiClient } from './client';
import type { Trade, TradeFilter, PlaceTradeRequest } from '@tradescope/shared-types';

export async function getTrades(filters: TradeFilter = {}) {
  const res = await apiClient.get('/trades', { params: filters });
  return res.data;
}

export async function placeTrade(data: PlaceTradeRequest): Promise<Trade> {
  const res = await apiClient.post('/trades', data);
  return res.data.data;
}

export async function closeTrade(tradeId: string, exitPrice: number): Promise<Trade> {
  const res = await apiClient.post(`/trades/${tradeId}/close`, { exit_price: exitPrice });
  return res.data.data;
}
