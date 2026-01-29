import { api, type ApiClientResult } from '@/lib/api/client';

import type { NotificationListResponse, UnreadCountResponse } from '@/types/notifications';

export type GetNotificationsParams = {
  size?: number | null;
  lastId?: number | null;
};

export async function getNotifications(
  params?: GetNotificationsParams,
): Promise<ApiClientResult<NotificationListResponse>> {
  const queryParams = new URLSearchParams();

  const size = params?.size;
  if (size !== null && size !== undefined) {
    queryParams.set('size', String(size));
  }

  const lastId = params?.lastId;
  if (lastId !== null && lastId !== undefined) {
    queryParams.set('lastId', String(lastId));
  }

  const queryString = queryParams.toString();
  const path = queryString ? `/api/notifications?${queryString}` : '/api/notifications';

  return api.get<NotificationListResponse>(path);
}

export async function getUnreadCount(): Promise<ApiClientResult<UnreadCountResponse>> {
  return api.get<UnreadCountResponse>('/api/notifications/unread');
}
