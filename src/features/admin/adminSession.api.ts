import { api } from '../../lib/api';

export async function loginAdmin(username: string, password: string): Promise<void> {
  const body = new URLSearchParams({ username, password });
  await api.post<void>('/api/auth/login', body);
}
