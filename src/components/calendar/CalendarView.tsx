'use client';

import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import { useCallback, useEffect, useRef } from 'react';

import { getStageColor } from '@/lib/calendar/colors';

import type {
  CalendarApi,
  DayCellContentArg,
  DatesSetArg,
  EventClickArg,
  EventContentArg,
  EventInput,
} from '@fullcalendar/core';
import type { DateClickArg } from '@fullcalendar/interaction';

type CalendarViewProps = {
  events: EventInput[];
  onDatesSet: (arg: DatesSetArg) => void;
  onEventClick: (arg: EventClickArg) => void;
  onDateSelect?: (arg: DateClickArg) => void;
  viewMode: 'month' | 'week';
  onApiReady?: (api: CalendarApi) => void;
  loading?: boolean;
  className?: string;
  selectedDate?: Date | null;
};

export default function CalendarView({
  events,
  onDatesSet,
  onEventClick,
  onDateSelect,
  viewMode,
  onApiReady,
  loading = false,
  className,
  selectedDate,
}: CalendarViewProps) {
  const calendarRef = useRef<FullCalendar | null>(null);
  const targetView = viewMode === 'week' ? 'dayGridWeek' : 'dayGridMonth';

  useEffect(() => {
    if (!onApiReady) return;
    const api = calendarRef.current?.getApi();
    if (api) {
      onApiReady(api);
    }
  }, [onApiReady]);

  useEffect(() => {
    const api = calendarRef.current?.getApi();
    if (!api || api.view.type === targetView) return;
    const timeoutId = window.setTimeout(() => {
      const nextApi = calendarRef.current?.getApi();
      if (nextApi && nextApi.view.type !== targetView) {
        nextApi.changeView(targetView);
      }
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [targetView]);

  const renderEventDot = (arg: EventContentArg) => {
    const stage = arg.event.extendedProps?.stage;
    const color = getStageColor(stage);

    return <span className="calendar-event-bar" style={{ backgroundColor: color }} />;
  };

  const renderDayNumber = (arg: DayCellContentArg) => {
    const numeric = String(arg.date.getDate());
    return <span className="calendar-day-number">{numeric}</span>;
  };

  const dayCellClassNames = useCallback(
    (arg: { date: Date }) => {
      if (!selectedDate) return [];
      const isSameDay =
        arg.date.getFullYear() === selectedDate.getFullYear() &&
        arg.date.getMonth() === selectedDate.getMonth() &&
        arg.date.getDate() === selectedDate.getDate();
      return isSameDay ? ['is-selected'] : [];
    },
    [selectedDate],
  );

  return (
    <div className={['relative', className].filter(Boolean).join(' ')}>
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView={targetView}
        timeZone="Asia/Seoul"
        locale="ko"
        headerToolbar={false}
        firstDay={1}
        showNonCurrentDates={false}
        fixedWeekCount={false}
        dayMaxEvents={3}
        dayHeaderFormat={{ weekday: 'short' }}
        height="auto"
        events={events}
        datesSet={onDatesSet}
        eventClick={onEventClick}
        dateClick={onDateSelect}
        eventContent={renderEventDot}
        dayCellContent={renderDayNumber}
        dayCellClassNames={dayCellClassNames}
      />
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-white/70 text-sm text-zinc-600">
          로딩 중...
        </div>
      )}
    </div>
  );
}
