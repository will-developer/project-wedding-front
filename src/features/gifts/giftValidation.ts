export function parseGiftPrice(value: string): number | null {
  const normalized = value.trim();
  if (!/^\d{1,8}(?:\.\d{1,2})?$/.test(normalized)) return null;
  const [whole, fraction = ''] = normalized.split('.');
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  return cents >= 1 && cents <= 9999999999 ? cents / 100 : null;
}

export function getGiftImageError(value: string): string | null {
  const link = value.trim();
  if (!link) return null;
  if (link.length > 2048) return 'O link da imagem deve ter até 2.048 caracteres.';
  try {
    const url = new URL(link);
    if (url.protocol === 'https:' && /^https:\/\/[^/]/i.test(link) && !/\s/.test(link) && !url.username && !url.password) return null;
  } catch {
    return 'Cole um link completo e válido para a imagem, começando com https://.';
  }
  return 'Use um link HTTPS válido para a imagem, sem espaços.';
}
