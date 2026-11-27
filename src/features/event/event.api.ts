import { api } from '../../lib/api';
import type { EventResponse } from './event.types';

export async function getAdminEvents(signal?: AbortSignal): Promise<EventResponse[]> {
  const { data } = await api.get<EventResponse[]>('/api/admin/events', { signal });
  return data;
}
