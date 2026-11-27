import type { InviteGroupResponse } from './inviteGroups.types';

function normalize(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').trim();
}

export function filterInviteGroups(groups: InviteGroupResponse[], query: string): InviteGroupResponse[] {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (!terms.length) return groups;
  return groups.filter((group) => {
    const text = normalize([group.groupName, group.inviteCode, ...group.guests.map((guest) => guest.name)].join(' '));
    return terms.every((term) => text.includes(term));
  });
}
