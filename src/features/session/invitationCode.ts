export function normalizeInvitationCode(value: string): string | null {
  const code = value.trim();
  return /^[a-z0-9]{6}$/i.test(code) ? code.toUpperCase() : null;
}

export function getInvitationCodeFromHash(hash: string): string {
  const codes = new URLSearchParams(hash.replace(/^#/, '')).getAll('code');
  return codes.length === 1 ? normalizeInvitationCode(codes[0]) ?? '' : '';
}
