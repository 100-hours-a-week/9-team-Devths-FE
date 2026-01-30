import { api, type ApiClientResult } from '@/lib/api/client';

import type { ApiResponse } from '@/types/api';
import type {
  GoogleEventCreateRequest,
  GoogleEventCreateResponse,
  GoogleEventDetailResponse,
  GoogleEventListResponse,
  GoogleEventUpdateRequest,
  InterviewStage,
  LocalDateString,
} from '@/types/calendar';

type ApiEnvelope<T> = ApiResponse<T | null>;

export type CalendarApiResult<T> = {
  ok: boolean;
  status: number;
  data: T | null;
  message: string | null;
  timestamp: string | null;
  json: ApiEnvelope<T> | null;
  res: Response;
};

export type ListEventsParams = {
  startDate: LocalDateString;
  endDate: LocalDateString;
  stage?: InterviewStage | null;
  tag?: string | null;
};

function unwrapApiResult<T>(result: ApiClientResult<T>): CalendarApiResult<T> {
  const json = result.json as ApiEnvelope<T> | null;

  return {
    ok: result.ok,
    status: result.status,
    data: json?.data ?? null,
    message: json?.message ?? null,
    timestamp: json?.timestamp ?? null,
    json,
    res: result.res,
  };
}

export async function createEvent(
  body: GoogleEventCreateRequest,
): Promise<CalendarApiResult<GoogleEventCreateResponse>> {
  const result = await api.post<GoogleEventCreateResponse>('/api/calendars', body, {
    credentials: 'include',
  });

  return unwrapApiResult(result);
}

export async function listEvents(
  params: ListEventsParams,
): Promise<CalendarApiResult<GoogleEventListResponse[]>> {
  const queryParams = new URLSearchParams({
    startDate: params.startDate,
    endDate: params.endDate,
  });

  if (params.stage) {
    queryParams.set('stage', params.stage);
  }

  if (params.tag) {
    queryParams.set('tag', params.tag);
  }

  const path = `/api/calendars?${queryParams.toString()}`;

  const result = await api.get<GoogleEventListResponse[]>(path, { credentials: 'include' });

  return unwrapApiResult(result);
}

export async function getEvent(
  eventId: string,
): Promise<CalendarApiResult<GoogleEventDetailResponse>> {
  const encodedEventId = encodeURIComponent(eventId);

  const result = await api.get<GoogleEventDetailResponse>(`/api/calendars/${encodedEventId}`, {
    credentials: 'include',
  });

  return unwrapApiResult(result);
}

export async function updateEvent(
  eventId: string,
  body: GoogleEventUpdateRequest,
): Promise<CalendarApiResult<GoogleEventCreateResponse>> {
  const encodedEventId = encodeURIComponent(eventId);

  const result = await api.put<GoogleEventCreateResponse>(
    `/api/calendars/${encodedEventId}`,
    body,
    {
      credentials: 'include',
    },
  );

  return unwrapApiResult(result);
}

export async function deleteEvent(eventId: string): Promise<CalendarApiResult<null>> {
  const encodedEventId = encodeURIComponent(eventId);

  const result = await api.delete<null>(`/api/calendars/${encodedEventId}`, {
    credentials: 'include',
  });

  if (result.status === 204) {
    return unwrapApiResult({ ...result, json: null });
  }

  return unwrapApiResult(result);
}
