const TIME_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
};

export function parseServerDateTime(value: string): Date {
  const normalized = value.includes(' ') ? value.replace(' ', 'T') : value;
  const hasTimezone = /([zZ]|[+-]\d{2}:\d{2})$/.test(normalized);
  if (hasTimezone) {
    return new Date(normalized);
  }

  // Server timestamps are serialized without timezone info but represent UTC.
  return new Date(`${normalized}Z`);
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('ko-KR', TIME_FORMAT_OPTIONS);
}

export function formatMessageTime(isoString: string): string {
  return formatTime(parseServerDateTime(isoString));
}

export function nowTimeLabel(now = new Date()): string {
  return formatTime(now);
}
