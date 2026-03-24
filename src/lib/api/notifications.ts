import { api, apiRequest, type ApiClientResult } from '@/lib/api/client';
import { getAccessToken } from '@/lib/auth/token';

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

export async function postFcmToken(
  deviceId: string,
  body: { token: string; deviceType: 'WEB' | 'ANDROID' | 'IOS' },
): Promise<ApiClientResult<unknown>> {
  return api.post(`/api/notifications/tokens/${encodeURIComponent(deviceId)}`, body);
}

export async function deleteFcmToken(deviceId: string): Promise<ApiClientResult<unknown>> {
  const token = getAccessToken();
  return apiRequest({
    method: 'DELETE',
    path: `/api/notifications/tokens/${encodeURIComponent(deviceId)}`,
    withAuth: false,
    credentials: 'include',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export async function patchFcmToken(
  deviceId: string,
  body: { isActive: boolean },
): Promise<ApiClientResult<unknown>> {
  return api.patch(`/api/notifications/tokens/${encodeURIComponent(deviceId)}`, body);
}
