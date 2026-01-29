function parseKstDate(isoString: string) {
  const trimmed = isoString.trim();
  if (!trimmed) return new Date(NaN);

  const normalized = trimmed.includes(' ') ? trimmed.replace(' ', 'T') : trimmed;
  const hasTimezone = /([zZ]|[+-]\d{2}:\d{2})$/.test(normalized);
  if (hasTimezone) {
    return new Date(normalized);
  }

  return new Date(`${normalized}+09:00`);
}

export function formatNotificationDate(isoString: string): string {
  const date = parseKstDate(isoString);
  if (Number.isNaN(date.getTime())) return isoString;

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  if (diffMs < 60 * 1000) {
    return '방금 전';
  }

  const diffMins = Math.floor(diffMs / (60 * 1000));
  if (diffMins < 60) {
    return `${diffMins}분 전`;
  }

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) {
    return `${diffHours}시간 전`;
  }

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}.${mm}.${dd}`;
}
