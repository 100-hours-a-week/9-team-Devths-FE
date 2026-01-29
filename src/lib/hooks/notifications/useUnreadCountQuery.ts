import { useQuery } from '@tanstack/react-query';

import { getUnreadCount } from '@/lib/api/notifications';
import { notificationKeys } from '@/lib/hooks/notifications/queryKeys';

export function useUnreadCountQuery() {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: async () => {
      const result = await getUnreadCount();

      if (!result.ok || !result.json) {
        throw new Error('Failed to fetch unread count');
      }

      if ('data' in result.json && result.json.data) {
        return result.json.data.unreadCount;
      }

      throw new Error('Invalid response format');
    },
    staleTime: 20_000,
  });
}
