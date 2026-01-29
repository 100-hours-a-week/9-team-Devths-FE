import { useInfiniteQuery } from '@tanstack/react-query';

import { getNotifications } from '@/lib/api/notifications';
import { notificationKeys } from '@/lib/hooks/notifications/queryKeys';

type UseNotificationsInfiniteQueryParams = {
  size?: number;
};

export function useNotificationsInfiniteQuery({ size }: UseNotificationsInfiniteQueryParams = {}) {
  return useInfiniteQuery({
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
  });
}
