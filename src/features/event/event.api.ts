import { api } from '../../lib/api';
import type { CreateEventRequest, EventResponse } from './event.types';

export async function getAdminEvents(signal?: AbortSignal): Promise<EventResponse[]> {
  const { data } = await api.get<EventResponse[]>('/api/admin/events', { signal });
  return data;
}

export async function createEvent(request: CreateEventRequest, receptionAtCeremonyLocation: boolean): Promise<EventResponse> {
  const { data } = await api.post<EventResponse>('/api/admin/events', request, {
    params: { receptionAtCeremonyLocation },
  });
  return data;
}
