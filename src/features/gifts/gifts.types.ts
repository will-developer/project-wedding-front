export interface CreateGiftRequest {
  name: string;
  description: string | null;
  imageUrl: string | null;
  price: number;
  totalQuantity: number;
}

export interface GiftResponse extends CreateGiftRequest {
  id: string;
  eventId: string;
  availableQuantity: number;
  active: boolean;
}
