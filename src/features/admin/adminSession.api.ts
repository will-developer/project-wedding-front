import { api } from '../../lib/api';

export interface AdminSessionResponse {
  login: string;
  role: 'ADMIN';
}

export async function getAdminSession(signal?: AbortSignal): Promise<AdminSessionResponse> {
  const { data } = await api.get<AdminSessionResponse>('/api/auth/me', { signal });
  return data;
}

export async function loginAdmin(username: string, password: string): Promise<void> {
  const body = new URLSearchParams({ username, password });
  await api.post<void>('/api/auth/login', body);
}

export async function logoutAdmin(): Promise<void> {
  await api.post<void>('/api/auth/logout');
}
