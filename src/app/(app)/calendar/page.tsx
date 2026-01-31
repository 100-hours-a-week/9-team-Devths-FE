'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import CalendarFilters from '@/components/calendar/CalendarFilters';
import CalendarView from '@/components/calendar/CalendarView';
import EventDetailModal from '@/components/calendar/EventDetailModal';
import EventFormModal, { type EventFormMode } from '@/components/calendar/EventFormModal';
import TodoSummaryCard from '@/components/todo/TodoSummaryCard';
import { createEvent, deleteEvent, getEvent, listEvents, updateEvent } from '@/lib/api/calendar';
import { toFullCalendarEvent } from '@/lib/calendar/mappers';
import { getSeoulDateRangeFromDatesSet, toLocalDate } from '@/lib/datetime/seoul';

import type { GoogleEventDetailResponse, InterviewStage } from '@/types/calendar';
import type { CalendarApi, DatesSetArg, EventClickArg, EventInput } from '@fullcalendar/core';
import type { DateClickArg } from '@fullcalendar/interaction';

type DateRange = ReturnType<typeof getSeoulDateRangeFromDatesSet>;

const stageDotClasses: Record<InterviewStage, string> = {
  DOCUMENT: 'bg-blue-500',
  CODING_TEST: 'bg-purple-500',
  INTERVIEW: 'bg-green-500',
};

const formatDateLabel = (date: Date) =>
  date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' });

const getWeekOfMonth = (date: Date) => {
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const firstDayIndex = (firstDayOfMonth.getDay() + 6) % 7;
  return Math.ceil((date.getDate() + firstDayIndex) / 7);
};

const formatEventTime = (start: Date | null, end: Date | null) => {
  if (!start) return '';
  if (!end) {
    return start.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  }

  const sameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate();

  if (sameDay) {
    return `${start.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString(
      'ko-KR',
      { hour: '2-digit', minute: '2-digit' },
    )}`;
  }

  return `${start.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })} ~ ${end.toLocaleDateString(
    'ko-KR',
    { month: 'short', day: 'numeric' },
  )}`;
};

export default function CalendarPage() {
  const [events, setEvents] = useState<EventInput[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stageFilter, setStageFilter] = useState<InterviewStage | ''>('');
  const [tagFilter, setTagFilter] = useState('');
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [currentStart, setCurrentStart] = useState<Date | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [detail, setDetail] = useState<GoogleEventDetailResponse | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<EventFormMode>('create');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const currentRangeRef = useRef<DateRange | null>(null);
  const requestIdRef = useRef(0);
  const detailRequestIdRef = useRef(0);
  const calendarApiRef = useRef<CalendarApi | null>(null);

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

        const mappedEvents: EventInput[] = (result.data ?? []).map(toFullCalendarEvent);

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
      setCurrentStart(arg.view.currentStart);
      await fetchEvents(range, { stage: stageFilter, tag: tagFilter });
    },
    [fetchEvents, stageFilter, tagFilter],
  );

  useEffect(() => {
    if (!currentRangeRef.current) return;
    fetchEvents(currentRangeRef.current, { stage: stageFilter, tag: tagFilter });
  }, [fetchEvents, stageFilter, tagFilter]);

  const handleCloseDetail = useCallback(() => {
    detailRequestIdRef.current += 1;
    setDetailOpen(false);
    setDetail(null);
    setDetailError(null);
    setDetailLoading(false);
    setDeleteLoading(false);
  }, []);

  const fetchDetail = useCallback(async (eventId: string, options?: { open?: boolean }) => {
    if (!eventId) return;
    const requestId = detailRequestIdRef.current + 1;
    detailRequestIdRef.current = requestId;

    if (options?.open ?? true) {
      setDetailOpen(true);
    }
    setDetailLoading(true);
    setDetailError(null);
    setDetail(null);

    try {
      const result = await getEvent(eventId);

      if (detailRequestIdRef.current !== requestId) return;

      if (!result.ok) {
        const message = result.status === 403 ? 'Devths에서 생성한 일정만 볼 수 있어요.' : null;
        setDetailError(message ?? result.message ?? '일정 조회에 실패했습니다.');
        setDetailLoading(false);
        return;
      }

      if (!result.data) {
        setDetailError('일정 정보를 불러올 수 없습니다.');
        setDetailLoading(false);
        return;
      }

      setDetail(result.data);
      setDetailLoading(false);
    } catch {
      if (detailRequestIdRef.current !== requestId) return;
      setDetailError('일정 조회에 실패했습니다.');
      setDetailLoading(false);
    }
  }, []);

  const handleEventClick = useCallback(
    async (arg: EventClickArg) => {
      const eventId = String(arg.event.id ?? '');
      await fetchDetail(eventId, { open: true });
    },
    [fetchDetail],
  );

  const handleCreated = useCallback(() => {
    if (!currentRangeRef.current) return;
    fetchEvents(currentRangeRef.current, { stage: stageFilter, tag: tagFilter });
  }, [fetchEvents, stageFilter, tagFilter]);

  const handleCreateOpen = useCallback(() => {
    setFormMode('create');
    setFormError(null);
    setFormOpen(true);
  }, []);

  const handleResetFilters = useCallback(() => {
    setStageFilter('');
    setTagFilter('');
  }, []);

  const handleEditOpen = useCallback(() => {
    if (!detail) return;
    setDetailOpen(false);
    setFormMode('edit');
    setFormError(null);
    setFormOpen(true);
  }, [detail]);

  const handleFormClose = useCallback(() => {
    setFormOpen(false);
    setFormError(null);
  }, []);

  const handleFormSubmit = useCallback(
    async (payload: Parameters<typeof createEvent>[0]) => {
      setFormSubmitting(true);
      setFormError(null);

      try {
        if (formMode === 'edit') {
          if (!detail) {
            setFormError('일정 정보를 불러올 수 없습니다.');
            return;
          }

          const result = await updateEvent(detail.eventId, payload);
          if (!result.ok) {
            setFormError(result.message ?? '일정 수정에 실패했습니다.');
            return;
          }

          setFormOpen(false);
          if (currentRangeRef.current) {
            fetchEvents(currentRangeRef.current, { stage: stageFilter, tag: tagFilter });
          }
          await fetchDetail(detail.eventId, { open: true });
          return;
        }

        const result = await createEvent(payload);
        if (!result.ok) {
          setFormError(result.message ?? '일정 생성에 실패했습니다.');
          return;
        }

        setFormOpen(false);
        handleCreated();
      } catch {
        setFormError('요청 처리 중 문제가 발생했습니다.');
      } finally {
        setFormSubmitting(false);
      }
    },
    [detail, fetchDetail, fetchEvents, formMode, handleCreated, stageFilter, tagFilter],
  );

  const handleDelete = useCallback(async () => {
    if (!detail || deleteLoading) return;
    const confirmed = window.confirm('이 일정을 삭제할까요?');
    if (!confirmed) return;

    setDeleteLoading(true);

    try {
      const result = await deleteEvent(detail.eventId);

      if (!result.ok) {
        setDetailError(result.message ?? '일정 삭제에 실패했습니다.');
        return;
      }

      handleCloseDetail();

      if (currentRangeRef.current) {
        fetchEvents(currentRangeRef.current, { stage: stageFilter, tag: tagFilter });
      }
    } catch {
      setDetailError('일정 삭제에 실패했습니다.');
    } finally {
      setDeleteLoading(false);
    }
  }, [deleteLoading, detail, fetchEvents, handleCloseDetail, stageFilter, tagFilter]);

  const handleCalendarReady = useCallback((api: CalendarApi) => {
    calendarApiRef.current = api;
  }, []);

  const handleDateSelect = useCallback((arg: DateClickArg) => {
    setSelectedDate((prev) => {
      if (!prev) return arg.date;
      const sameDay =
        prev.getFullYear() === arg.date.getFullYear() &&
        prev.getMonth() === arg.date.getMonth() &&
        prev.getDate() === arg.date.getDate();
      return sameDay ? null : arg.date;
    });
  }, []);

  const handlePrev = useCallback(() => {
    calendarApiRef.current?.prev();
  }, []);

  const handleNext = useCallback(() => {
    calendarApiRef.current?.next();
  }, []);

  const handleEventRowClick = useCallback(
    async (eventId: string) => {
      await fetchDetail(eventId, { open: true });
    },
    [fetchDetail],
  );

  const baseTitle = formatDateLabel(currentStart ?? new Date());
  const currentTitle =
    viewMode === 'week' && currentStart
      ? `${baseTitle} ${getWeekOfMonth(currentStart)}주차`
      : baseTitle;
  const selectedDateFilter = useMemo(
    () => (selectedDate ? toLocalDate(selectedDate) : undefined),
    [selectedDate],
  );
  const filteredEvents = useMemo(() => {
    if (!selectedDateFilter) return events;

    const targetKey = selectedDateFilter.replace(/-/g, '');

    return events.filter((event) => {
      if (!event.start) return false;

      const startDate = toLocalDate(new Date(event.start as string | number | Date));
      const endDate = event.end
        ? toLocalDate(new Date(event.end as string | number | Date))
        : startDate;

      const startKey = startDate.replace(/-/g, '');
      const endKey = endDate.replace(/-/g, '');

      const rangeStart = startKey <= endKey ? startKey : endKey;
      const rangeEnd = startKey <= endKey ? endKey : startKey;

      return targetKey >= rangeStart && targetKey <= rangeEnd;
    });
  }, [events, selectedDateFilter]);
  const sortedEvents = useMemo(() => {
    return [...filteredEvents].sort((a, b) => {
      const startA = a.start ? new Date(a.start as string | number | Date).getTime() : 0;
      const startB = b.start ? new Date(b.start as string | number | Date).getTime() : 0;
      return startA - startB;
    });
  }, [filteredEvents]);

  return (
    <main className="calendar-shell pb-8">
      <div className="-mx-4 border-b border-[#E8E8E8] bg-white">
        <div className="flex">
          <button
            type="button"
            onClick={() => setViewMode('month')}
            className={`flex-1 py-3 text-sm font-medium transition-all ${
              viewMode === 'month' ? 'border-b-2 border-[#151515] text-[#151515]' : 'text-[#8A8A8A]'
            }`}
          >
            월간
          </button>
          <button
            type="button"
            onClick={() => setViewMode('week')}
            className={`flex-1 py-3 text-sm font-medium transition-all ${
              viewMode === 'week' ? 'border-b-2 border-[#151515] text-[#151515]' : 'text-[#8A8A8A]'
            }`}
          >
            주간
          </button>
        </div>
      </div>

      <CalendarFilters
        stage={stageFilter}
        tag={tagFilter}
        onStageChange={setStageFilter}
        onTagChange={setTagFilter}
        onReset={handleResetFilters}
      />

      {!loading && error ? <p className="mt-3 mb-2 text-sm text-red-600">{error}</p> : null}

      <section className="-mx-4 border-b border-[#E8E8E8] bg-white px-4 py-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-base font-semibold text-[#151515]">{currentTitle}</div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handlePrev}
              className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-[#F2F2F2]"
              aria-label="이전"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-[#F2F2F2]"
              aria-label="다음"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>

        <CalendarView
          className="calendar-grid"
          events={events}
          onDatesSet={handleDatesSet}
          onEventClick={handleEventClick}
          onDateSelect={handleDateSelect}
          viewMode={viewMode}
          onApiReady={handleCalendarReady}
          loading={loading}
          selectedDate={selectedDate}
        />
      </section>

      <section className="pt-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-[#151515]">
            일정 목록
            {sortedEvents.length > 0 ? (
              <span className="ml-2 text-sm font-normal text-[#8A8A8A]">
                {sortedEvents.length}개
              </span>
            ) : null}
          </h2>
          <button
            type="button"
            onClick={handleCreateOpen}
            className="flex h-9 items-center gap-1 rounded-lg bg-[#05C075] px-4 text-sm font-medium text-white transition-all hover:bg-[#04A865]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            추가
          </button>
        </div>

        {sortedEvents.length === 0 && !loading && !error ? (
          <div className="rounded-2xl border border-[#E8E8E8] bg-white px-4 py-12 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#E8E8E8] bg-[#FAFAFA]">
              <svg
                className="h-7 w-7 text-[#C8C8C8]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.6}
                  d="M8 7V3m8 4V3M4 11h16M6 19h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-sm text-[#8A8A8A]">
              등록된 일정이 없습니다. 새 일정을 추가해보세요!
            </p>
          </div>
        ) : null}

        {sortedEvents.length > 0 ? (
          <div className="space-y-2">
            {sortedEvents.map((event) => {
              const stage = event.extendedProps?.stage as InterviewStage | undefined;
              const dotClass = stage ? stageDotClasses[stage] : 'bg-zinc-400';
              const startDate = event.start
                ? new Date(event.start as string | number | Date)
                : null;
              const endDate = event.end ? new Date(event.end as string | number | Date) : null;
              const title = String(event.title ?? '');
              const displayTitle = title.replace(/^\[[^\]]+\]\s*/, '') || title;

              return (
                <button
                  key={String(event.id ?? title)}
                  type="button"
                  onClick={() => handleEventRowClick(String(event.id ?? ''))}
                  className="flex w-full items-center gap-3 rounded-lg border border-[#E8E8E8] bg-white p-3 text-left shadow-sm transition-all hover:shadow-md"
                >
                  <span className={`h-2.5 w-2.5 rounded-full ${dotClass}`} />
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate text-sm font-medium text-[#151515]">{displayTitle}</p>
                    <p className="text-xs text-[#8A8A8A]">{formatEventTime(startDate, endDate)}</p>
                  </div>
                </button>
              );
            })}
          </div>
        ) : null}
      </section>

      <section className="pt-4 pb-8">
        <TodoSummaryCard dateFilter={selectedDateFilter} />
      </section>

      <EventDetailModal
        open={detailOpen}
        onClose={handleCloseDetail}
        onEdit={handleEditOpen}
        onDelete={handleDelete}
        deleteLoading={deleteLoading}
        loading={detailLoading}
        error={detailError}
        detail={detail}
      />

      <EventFormModal
        open={formOpen}
        mode={formMode}
        detail={detail}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        submitting={formSubmitting}
        submitError={formError}
      />
    </main>
  );
}
