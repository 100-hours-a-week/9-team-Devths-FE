import { useQuery } from '@tanstack/react-query';

import { getUnreadCount } from '@/lib/api/notifications';
import { getAccessToken } from '@/lib/auth/token';
import { notificationKeys } from '@/lib/hooks/notifications/queryKeys';

export function useUnreadCountQuery() {
  const hasAccessToken = !!getAccessToken();

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
    enabled: hasAccessToken,
    staleTime: 20_000,
  });
}
