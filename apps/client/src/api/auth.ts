import { apiClient } from './client';
import type { AuthResponse, LoginRequest, RegisterRequest } from '@tradescope/shared-types';

export async function login(data: LoginRequest): Promise<AuthResponse> {
  const res = await apiClient.post('/auth/login', data);
  return res.data.data;
}

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const res = await apiClient.post('/auth/register', data);
  return res.data.data;
}

export async function getMe() {
  const res = await apiClient.get('/users/me');
  return res.data.data;
}
