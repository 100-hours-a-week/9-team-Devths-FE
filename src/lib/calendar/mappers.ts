import type { GoogleEventListResponse } from '@/types/calendar';
import type { EventInput } from '@fullcalendar/core';

export function toFullCalendarEvent(item: GoogleEventListResponse): EventInput {
  const stageLabel =
    item.stage === 'DOCUMENT'
      ? '서류'
      : item.stage === 'CODING_TEST'
        ? '코딩 테스트'
        : '면접';

  return {
    id: item.eventId,
    title: `[${stageLabel}] ${item.title}`,
    start: item.startTime,
    end: item.endTime,
    extendedProps: {
      stage: item.stage,
      tags: item.tags,
    },
  };
}
