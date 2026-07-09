import { apiClient } from './client';
import type { TransactionFilter, DepositRequest, WithdrawalRequest } from '@tradescope/shared-types';

export async function getTransactions(filters: TransactionFilter = {}) {
  const res = await apiClient.get('/transactions', { params: filters });
  return res.data;
}

export async function createDeposit(data: DepositRequest) {
  const res = await apiClient.post('/transactions/deposit', data);
  return res.data.data;
}

export async function createWithdrawal(data: WithdrawalRequest) {
  const res = await apiClient.post('/transactions/withdrawal', data);
  return res.data.data;
}
