import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { getNotifications } from '@/lib/api/notifications';
import { getAccessToken } from '@/lib/auth/token';
import { notificationKeys } from '@/lib/hooks/notifications/queryKeys';

type UseNotificationsInfiniteQueryParams = {
  size?: number;
};

export function useNotificationsInfiniteQuery({ size }: UseNotificationsInfiniteQueryParams = {}) {
  const queryClient = useQueryClient();
  const hasAccessToken = !!getAccessToken();

  const query = useInfiniteQuery({
    queryKey: notificationKeys.list({ size }),
    queryFn: async ({ pageParam }) => {
      const result = await getNotifications({
        size,
        lastId: pageParam,
      });

      if (!result.ok || !result.json) {
        throw new Error('Failed to fetch notifications');
      }

      if ('data' in result.json && result.json.data) {
        return result.json.data;
      }

      throw new Error('Invalid response format');
    },
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasNext) return undefined;
      return lastPage.lastId ?? undefined;
    },
    enabled: hasAccessToken,
  });

  useEffect(() => {
    if (query.isSuccess) {
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
    }
  }, [query.isSuccess, queryClient]);

  return query;
}
