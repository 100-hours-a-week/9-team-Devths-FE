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
};

export default function CalendarView({ events, onDatesSet, onEventClick }: CalendarViewProps) {
  return (
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
  );
}
