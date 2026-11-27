import { api } from '../../lib/api';
import type { CreateInviteGroupRequest, InviteGroupResponse } from './inviteGroups.types';

function groupsUrl(eventId: string) {
  return `/api/admin/events/${encodeURIComponent(eventId)}/invite-groups`;
}

export async function getInviteGroups(eventId: string, signal?: AbortSignal): Promise<InviteGroupResponse[]> {
  const { data } = await api.get<InviteGroupResponse[]>(groupsUrl(eventId), { signal });
  return data;
}

export async function createInviteGroup(eventId: string, request: CreateInviteGroupRequest): Promise<InviteGroupResponse> {
  const { data } = await api.post<InviteGroupResponse>(groupsUrl(eventId), request);
  return data;
}
