'use client';

import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { useCallback, useEffect, useRef, useState } from 'react';

import { listEvents } from '@/lib/api/calendar';
import { getSeoulDateRangeFromDatesSet } from '@/lib/datetime/seoul';

import type { InterviewStage } from '@/types/calendar';
import type { DatesSetArg, EventInput } from '@fullcalendar/core';

type DateRange = ReturnType<typeof getSeoulDateRangeFromDatesSet>;

export default function CalendarPage() {
  const [events, setEvents] = useState<EventInput[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stageFilter, setStageFilter] = useState<InterviewStage | ''>('');
  const [tagFilter, setTagFilter] = useState('');
  const currentRangeRef = useRef<DateRange | null>(null);
  const requestIdRef = useRef(0);

  const fetchEvents = useCallback(
    async (range: DateRange, filters: { stage: InterviewStage | ''; tag: string }) => {
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;

      setLoading(true);
      setError(null);

      const trimmedTag = filters.tag.trim();
      const stage = filters.stage === '' ? null : filters.stage;
      const tag = trimmedTag.length > 0 ? trimmedTag : null;

      try {
        const result = await listEvents({ ...range, stage, tag });

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
    },
    [],
  );

  const handleDatesSet = useCallback(
    async (arg: DatesSetArg) => {
      const range = getSeoulDateRangeFromDatesSet(arg);
      currentRangeRef.current = range;
      await fetchEvents(range, { stage: stageFilter, tag: tagFilter });
    },
    [fetchEvents, stageFilter, tagFilter],
  );

  useEffect(() => {
    if (!currentRangeRef.current) return;
    fetchEvents(currentRangeRef.current, { stage: stageFilter, tag: tagFilter });
  }, [fetchEvents, stageFilter, tagFilter]);

  return (
    <main className="calendar-shell p-6">
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span>전형 단계</span>
          <select
            className="border-input bg-background h-9 rounded-md border px-3 text-sm"
            value={stageFilter}
            onChange={(event) => setStageFilter(event.target.value as InterviewStage | '')}
          >
            <option value="">전체</option>
            <option value="DOCUMENT">서류</option>
            <option value="CODING_TEST">코딩 테스트</option>
            <option value="INTERVIEW">면접</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>태그</span>
          <input
            className="border-input bg-background h-9 rounded-md border px-3 text-sm"
            type="text"
            placeholder="태그 입력"
            value={tagFilter}
            onChange={(event) => setTagFilter(event.target.value)}
          />
        </label>
      </div>
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
