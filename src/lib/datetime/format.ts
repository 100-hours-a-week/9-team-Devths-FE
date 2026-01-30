import type { LocalDateString } from '@/types/calendar';
import { toLocalDate } from '@/lib/datetime/seoul';

export const LOCAL_DATE_FORMAT = 'yyyy-MM-dd';

export function getSeoulToday(): LocalDateString {
  return toLocalDate(new Date());
}
