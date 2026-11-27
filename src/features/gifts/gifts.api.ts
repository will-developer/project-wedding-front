import { api } from '../../lib/api';
import type { CreateGiftRequest, GiftResponse, UpdateGiftRequest } from './gifts.types';

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

export async function updateGift(eventId: string, giftId: string, request: UpdateGiftRequest): Promise<GiftResponse> {
  const { data } = await api.put<GiftResponse>(`${giftsUrl(eventId)}/${encodeURIComponent(giftId)}`, request);
  return data;
}

export async function setGiftActive(eventId: string, giftId: string, active: boolean): Promise<GiftResponse> {
  const { data } = await api.patch<GiftResponse>(`${giftsUrl(eventId)}/${encodeURIComponent(giftId)}/active`, null, { params: { active } });
  return data;
}
