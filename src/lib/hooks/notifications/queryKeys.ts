type NotificationListParams = {
  size?: number | null;
  lastId?: number | null;
};

const normalizeListParams = (params?: NotificationListParams) => ({
  size: params?.size ?? null,
  lastId: params?.lastId ?? null,
});

export const notificationKeys = {
  all: ['notifications'] as const,
  list: (params?: NotificationListParams) =>
    [...notificationKeys.all, 'list', normalizeListParams(params)] as const,
  unreadCount: () => [...notificationKeys.all, 'unreadCount'] as const,
};
