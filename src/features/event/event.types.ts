export interface EventResponse {
  id: string;
  title: string;
  eventDate: string;
  ceremonyLocation: string;
  receptionLocation: string | null;
  ceremonyMapsUrl: string;
  receptionMapsUrl: string | null;
  rsvpDeadline: string;
  createdAt: string;
}
