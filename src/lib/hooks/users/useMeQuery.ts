import { useQuery } from '@tanstack/react-query';

import { fetchMe } from '@/lib/api/users';
import { userKeys } from '@/lib/hooks/users/queryKeys';

export function useMeQuery() {
  return useQuery({
    queryKey: userKeys.me(),
    queryFn: async () => {
      const result = await fetchMe();

      if (!result.ok || !result.json) {
        throw new Error('Failed to fetch user profile');
      }

      if ('data' in result.json) {
        return result.json.data;
      }

      throw new Error('Invalid response format');
    },
  });
}
