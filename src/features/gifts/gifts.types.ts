export interface UpdateGiftRequest {
  name: string;
  description: string | null;
  imageUrl: string | null;
  price: number;
}

export interface CreateGiftRequest extends UpdateGiftRequest {
  totalQuantity: number;
}

export interface GiftResponse extends CreateGiftRequest {
  id: string;
  eventId: string;
  availableQuantity: number;
  active: boolean;
}
