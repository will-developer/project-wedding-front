export function getMapLinkError(value: string, label: string): string | null {
  const link = value.trim();
  if (!link) return `Preencha o campo “${label}”.`;
  if (link.length > 2048) return `O campo “${label}” aceita até 2.048 caracteres. No Google Maps, use Compartilhar → Copiar link para obter um endereço mais curto.`;
  if (/\s/.test(link)) return `O campo “${label}” contém espaços ou quebras de linha. Copie novamente o link completo do mapa.`;
  if (!/^[a-z][a-z\d+.-]*:/i.test(link)) return `Cole o link completo em “${label}”, começando com https://.`;
  try {
    const url = new URL(link);
    if (url.protocol !== 'https:') return `O campo “${label}” precisa de um link com https://. Copie o endereço seguro do mapa.`;
    if (!/^https:\/\/[^/]/i.test(link) || !url.hostname || url.username || url.password) {
      return `O endereço em “${label}” está incompleto ou inválido. Copie novamente pelo botão Compartilhar do mapa.`;
    }
    return null;
  } catch {
    return `O endereço em “${label}” está incompleto ou inválido. Copie novamente pelo botão Compartilhar do mapa.`;
  }
}
