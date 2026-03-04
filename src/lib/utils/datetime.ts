const TIME_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
};

export function nowTimeLabel(now = new Date()): string {
  return now.toLocaleTimeString('ko-KR', TIME_FORMAT_OPTIONS);
}
