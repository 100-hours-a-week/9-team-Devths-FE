import type { GoogleEventListResponse } from '@/types/calendar';
import type { EventInput } from '@fullcalendar/core';

export function toFullCalendarEvent(item: GoogleEventListResponse): EventInput {
  return {
    id: item.eventId,
    title: item.title,
    start: item.startTime,
    end: item.endTime,
    extendedProps: {
      stage: item.stage,
      tags: item.tags,
    },
  };
}
