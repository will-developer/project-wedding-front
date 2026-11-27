import { api } from '../../lib/api';
import type { CreateGiftRequest, GiftResponse } from './gifts.types';

function giftsUrl(eventId: string) {
  return `/api/admin/events/${encodeURIComponent(eventId)}/gifts`;
}

export async function getGifts(eventId: string, signal?: AbortSignal): Promise<GiftResponse[]> {
  const { data } = await api.get<GiftResponse[]>(giftsUrl(eventId), { signal });
  return data;
}

export async function createGift(eventId: string, request: CreateGiftRequest): Promise<GiftResponse> {
  const { data } = await api.post<GiftResponse>(giftsUrl(eventId), request);
  return data;
}
