export interface InviteGroupGuest {
  id: string;
  name: string;
  isChild: boolean;
  rsvpStatus: string;
  respondedAt: string | null;
}

export interface InviteGroupResponse {
  id: string;
  eventId: string;
  groupName: string;
  inviteCode: string;
  notes: string | null;
  createdAt: string;
  guests: InviteGroupGuest[];
}

export interface CreateInviteGroupRequest {
  groupName: string;
  notes: string | null;
  guests: { name: string; isChild: boolean }[];
}
