export type InterviewStage = 'DOCUMENT' | 'CODING_TEST' | 'INTERVIEW';

export type NotificationUnit = 'MINUTE' | 'HOUR' | 'DAY';

export type LocalDateString = string;

export type LocalDateTimeString = string;

export type GoogleEventCreateRequest = {
  stage: InterviewStage;
  title: string;
  company: string;
  startTime: LocalDateTimeString;
  endTime: LocalDateTimeString;
  description?: string | null;
  tags?: string[] | null;
  notificationTime: number;
  notificationUnit: NotificationUnit;
};

export type GoogleEventCreateResponse = {
  eventId: string;
};

export type GoogleEventUpdateRequest = GoogleEventCreateRequest;

export type GoogleEventListResponse = {
  eventId: string;
  title: string;
  startTime: LocalDateTimeString;
  endTime: LocalDateTimeString;
  stage: InterviewStage;
  tags: string[];
};

export type GoogleEventDetailResponse = {
  eventId: string;
  stage: InterviewStage;
  title: string;
  company: string;
  startTime: LocalDateTimeString;
  endTime: LocalDateTimeString;
  description: string | null;
  notificationTime: number | null;
  notificationUnit: NotificationUnit;
  tags: string[];
  createdAt: LocalDateTimeString;
  updatedAt: LocalDateTimeString;
};

export type { ApiResponse } from './api';
