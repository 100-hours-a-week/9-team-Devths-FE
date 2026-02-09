export function formatCountCompact(value: number, fractionDigits = 1): string {
  if (!Number.isFinite(value)) return '0';

  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (absValue < 1000) {
    return `${value}`;
  }

  const formatWithUnit = (divisor: number, unit: string) => {
    const raw = absValue / divisor;
    const fixed = raw.toFixed(fractionDigits);
    const trimmed = fixed.replace(/\.0$/, '');
    return `${sign}${trimmed}${unit}`;
  };

  if (absValue >= 1_000_000) {
    return formatWithUnit(1_000_000, 'M');
  }

  return formatWithUnit(1000, 'K');
}
