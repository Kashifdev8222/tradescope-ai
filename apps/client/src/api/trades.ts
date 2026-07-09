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

export async function updateTradeSLTP(tradeId: string, stopLoss?: number, takeProfit?: number) {
  const res = await apiClient.patch(`/trades/${tradeId}`, { stop_loss: stopLoss, take_profit: takeProfit });
  return res.data.data;
}
