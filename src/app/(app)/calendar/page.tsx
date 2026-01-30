'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import CalendarFilters from '@/components/calendar/CalendarFilters';
import CalendarView from '@/components/calendar/CalendarView';
import EventDetailModal from '@/components/calendar/EventDetailModal';
import EventFormModal, { type EventFormMode } from '@/components/calendar/EventFormModal';
import { createEvent, deleteEvent, getEvent, listEvents, updateEvent } from '@/lib/api/calendar';
import { toFullCalendarEvent } from '@/lib/calendar/mappers';
import { getSeoulDateRangeFromDatesSet } from '@/lib/datetime/seoul';

import type { GoogleEventDetailResponse, InterviewStage } from '@/types/calendar';
import type { DatesSetArg, EventClickArg, EventInput } from '@fullcalendar/core';

type DateRange = ReturnType<typeof getSeoulDateRangeFromDatesSet>;

export default function CalendarPage() {
  const [events, setEvents] = useState<EventInput[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stageFilter, setStageFilter] = useState<InterviewStage | ''>('');
  const [tagFilter, setTagFilter] = useState('');
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
        const message =
          result.status === 403 ? 'Devths에서 생성한 일정만 볼 수 있어요.' : null;
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

  return (
    <main className="calendar-shell p-6">
      <CalendarFilters
        stage={stageFilter}
        tag={tagFilter}
        onStageChange={setStageFilter}
        onTagChange={setTagFilter}
        onCreate={handleCreateOpen}
      />
      {loading && <p className="mb-2 text-sm">로딩 중...</p>}
      {!loading && error && <p className="mb-2 text-sm text-red-600">{error}</p>}

      <CalendarView
        events={events}
        onDatesSet={handleDatesSet}
        onEventClick={handleEventClick}
      />

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
