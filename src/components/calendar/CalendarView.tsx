'use client';

import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';

import type { DatesSetArg, EventClickArg, EventInput } from '@fullcalendar/core';

type CalendarViewProps = {
  events: EventInput[];
  onDatesSet: (arg: DatesSetArg) => void;
  onEventClick: (arg: EventClickArg) => void;
  loading?: boolean;
};

export default function CalendarView({
  events,
  onDatesSet,
  onEventClick,
  loading = false,
}: CalendarViewProps) {
  return (
    <div className="relative">
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
        datesSet={onDatesSet}
        eventClick={onEventClick}
      />
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-white/70 text-sm text-zinc-600">
          로딩 중...
        </div>
      )}
    </div>
  );
}
