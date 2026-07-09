import { apiClient } from './client';

// Users
export async function listUsers(params: Record<string, any> = {}) {
  const res = await apiClient.get('/admin/users', { params });
  return res.data;
}

export async function updateUserStatus(userId: string, isActive: boolean) {
  const res = await apiClient.patch(`/admin/users/${userId}/status`, { is_active: isActive });
  return res.data.data;
}

export async function toggleUserAI(userId: string) {
  const res = await apiClient.patch(`/admin/users/${userId}/ai-toggle`);
  return res.data.data;
}

// Balances
export async function getBalancesSummary() {
  const res = await apiClient.get('/admin/balances');
  return res.data.data;
}

export async function adjustBalance(accountId: string, amount: number, reason: string) {
  const res = await apiClient.patch(`/admin/balances/${accountId}`, { amount, reason });
  return res.data.data;
}

// Transactions
export async function listAllTransactions(params: Record<string, any> = {}) {
  const res = await apiClient.get('/admin/transactions', { params });
  return res.data;
}

export async function approveTransaction(txId: string) {
  const res = await apiClient.post(`/admin/transactions/${txId}/approve`);
  return res.data.data;
}

export async function rejectTransaction(txId: string) {
  const res = await apiClient.post(`/admin/transactions/${txId}/reject`);
  return res.data.data;
}

export async function exportCSV(params: Record<string, any> = {}) {
  const res = await apiClient.get('/admin/transactions/export/csv', { params, responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'transactions.csv');
  document.body.appendChild(link);
  link.click();
  link.remove();
}

// AI Control
export async function getAIParams() {
  const res = await apiClient.get('/admin/ai/params');
  return res.data.data;
}

export async function updateAIParams(params: Record<string, any>) {
  const res = await apiClient.patch('/admin/ai/params', params);
  return res.data.data;
}

export async function emergencyStop() {
  const res = await apiClient.post('/admin/ai/emergency-stop');
  return res.data;
}

export async function emergencyResume() {
  const res = await apiClient.post('/admin/ai/emergency-resume');
  return res.data;
}

export async function getAIStats() {
  const res = await apiClient.get('/admin/ai/stats');
  return res.data.data;
}

// Platform Settings
export async function getAllSettings() {
  const res = await apiClient.get('/admin/settings');
  return res.data.data;
}

export async function updateSetting(key: string, value: any) {
  const res = await apiClient.patch(`/admin/settings/${key}`, { value });
  return res.data.data;
}

// AI Overrides
export async function listAIOverrides() {
  const res = await apiClient.get('/admin/ai/overrides');
  return res.data.data;
}
export async function setAIOverride(userId: string, data: Record<string, any>) {
  const res = await apiClient.post(`/admin/ai/overrides/${userId}`, data);
  return res.data.data;
}
export async function removeAIOverride(userId: string) {
  const res = await apiClient.delete(`/admin/ai/overrides/${userId}`);
  return res.data.data;
}
// Users
export async function listUsersSimple() {
  const res = await apiClient.get('/admin/users?limit=100');
  return res.data.data || [];
}
