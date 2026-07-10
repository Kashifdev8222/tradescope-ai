import { apiClient } from './client';
import type { TradingAccount, PortfolioSummary, CreateAccountRequest } from '@tradescope/shared-types';

export async function getAccounts(): Promise<TradingAccount[]> {
  const res = await apiClient.get('/accounts');
  return res.data.data;
}

export async function getPortfolioSummary(): Promise<PortfolioSummary> {
  const res = await apiClient.get('/accounts/summary/portfolio');
  return res.data.data;
}

export async function createAccount(data: CreateAccountRequest): Promise<TradingAccount> {
  const res = await apiClient.post('/accounts', data);
  return res.data.data;
}
