import { toLocalDate } from '@/lib/datetime/seoul';

import type { LocalDateString } from '@/types/calendar';

export const LOCAL_DATE_FORMAT = 'yyyy-MM-dd';

export function getSeoulToday(): LocalDateString {
  return toLocalDate(new Date());
}
