import { api } from '../../lib/api';

export async function loginGuest(code: string) {
  await api.post<void>('/api/guest/login', { code });
}
