import { apiClient } from './client';

export interface MarketQuote {
  symbol: string; name: string; class: string;
  price: number; bid: number; ask: number; spread: number;
  change: number; changePercent: number;
  high: number; low: number; volume: number; timestamp: number;
}

export interface OHLCBar {
  time: number; open: number; high: number; low: number; close: number; volume: number;
}

export async function getQuotes(symbols?: string[], cls?: string): Promise<MarketQuote[]> {
  const params: Record<string, string> = {};
  if (symbols?.length) params.symbols = symbols.join(',');
  if (cls) params.class = cls;
  const res = await apiClient.get('/market/quotes', { params });
  return res.data.data;
}

export async function getCandles(symbol: string, timeframe = '1m', bars = 500): Promise<OHLCBar[]> {
  const res = await apiClient.get('/market/candles', { params: { symbol, timeframe, bars } });
  return res.data.data;
}

export async function getSymbols(): Promise<{ symbols: string[]; classes: string[] }> {
  const res = await apiClient.get('/market/symbols');
  return res.data.data;
}
