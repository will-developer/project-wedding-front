const formatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
});

export function toEventDateTime(instant: string): string {
  const parts = formatter.formatToParts(new Date(instant));
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((value) => value.type === type)?.value;
  return `${part('year')}-${part('month')}-${part('day')}T${part('hour')}:${part('minute')}:${part('second')}`;
}

export function toEventInstant(value: string): string {
  const normalized = value.length === 16 ? `${value}:00` : value;
  const candidate = Date.parse(`${normalized}Z`);
  if (!Number.isFinite(candidate)) throw new Error('Confira a data e o horário do evento.');
  const localAsUtc = Date.parse(`${toEventDateTime(new Date(candidate).toISOString())}Z`);
  const instant = new Date(candidate + candidate - localAsUtc).toISOString();
  if (toEventDateTime(instant) !== normalized) throw new Error('Confira a data e o horário do evento.');
  return instant;
}
