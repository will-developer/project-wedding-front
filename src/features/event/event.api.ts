import { api } from '../../lib/api';
import type { EventRequest, EventResponse } from './event.types';

export async function getAdminEvents(signal?: AbortSignal): Promise<EventResponse[]> {
  const { data } = await api.get<EventResponse[]>('/api/admin/events', { signal });
  return data;
}

export async function createEvent(request: EventRequest, receptionAtCeremonyLocation: boolean): Promise<EventResponse> {
  const { data } = await api.post<EventResponse>('/api/admin/events', request, {
    params: { receptionAtCeremonyLocation },
  });
  return data;
}

export async function updateEvent(eventId: string, request: EventRequest, receptionAtCeremonyLocation: boolean): Promise<EventResponse> {
  const { data } = await api.put<EventResponse>(`/api/admin/events/${encodeURIComponent(eventId)}`, request, {
    params: { receptionAtCeremonyLocation },
  });
  return data;
}
