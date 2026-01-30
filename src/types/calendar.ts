export type InterviewStage = 'DOCUMENT' | 'CODING_TEST' | 'INTERVIEW';

export type NotificationUnit = 'MINUTE' | 'HOUR' | 'DAY';

export type GoogleEventCreateRequest = {
  stage: InterviewStage;
  title: string;
  company: string;
  startTime: string;
  endTime: string;
  description?: string | null;
  tags?: string[] | null;
  notificationTime: number;
  notificationUnit: NotificationUnit;
};

export type GoogleEventCreateResponse = {
  eventId: string;
};

export type GoogleEventListResponse = {
  eventId: string;
  title: string;
  startTime: string;
  endTime: string;
  stage: InterviewStage;
  tags: string[];
};

export type GoogleEventDetailResponse = {
  eventId: string;
  stage: InterviewStage;
  title: string;
  company: string;
  startTime: string;
  endTime: string;
  description: string | null;
  notificationTime: number | null;
  notificationUnit: NotificationUnit;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export type { ApiResponse } from './api';
