'use client';

import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { useCallback, useRef, useState } from 'react';

import { listEvents } from '@/lib/api/calendar';
import { getSeoulDateRangeFromDatesSet } from '@/lib/datetime/seoul';

import type { DatesSetArg, EventInput } from '@fullcalendar/core';

export default function CalendarPage() {
  const [events, setEvents] = useState<EventInput[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const handleDatesSet = useCallback(async (arg: DatesSetArg) => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setLoading(true);
    setError(null);

    try {
      const { startDate, endDate } = getSeoulDateRangeFromDatesSet(arg);
      const result = await listEvents({ startDate, endDate });

      if (requestIdRef.current !== requestId) return;

      if (!result.ok) {
        setEvents([]);
        setError(result.message ?? '일정 조회에 실패했습니다.');
        return;
      }

      const mappedEvents: EventInput[] = (result.data ?? []).map((event) => ({
        id: event.eventId,
        title: event.title,
        start: event.startTime,
        end: event.endTime,
        extendedProps: {
          stage: event.stage,
          tags: event.tags,
        },
      }));

      setEvents(mappedEvents);
    } catch {
      if (requestIdRef.current !== requestId) return;

      setEvents([]);
      setError('일정 조회에 실패했습니다.');
    } finally {
      if (requestIdRef.current === requestId) {
        setLoading(false);
      }
    }
  }, []);

  return (
    <main className="calendar-shell p-6">
      {loading && <p className="mb-2 text-sm">로딩 중...</p>}
      {!loading && error && <p className="mb-2 text-sm text-red-600">{error}</p>}

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        timeZone="Asia/Seoul"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        height="auto"
        events={events}
        datesSet={handleDatesSet}
      />
    </main>
  );
}
