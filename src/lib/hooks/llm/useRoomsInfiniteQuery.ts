import { useInfiniteQuery } from '@tanstack/react-query';

import { fetchRooms } from '@/lib/api/llmRooms';

const ROOMS_QUERY_KEY = ['llm', 'rooms'] as const;
const PAGE_SIZE = 10;

export function useRoomsInfiniteQuery() {
  return useInfiniteQuery({
    queryKey: ROOMS_QUERY_KEY,
    queryFn: async ({ pageParam }) => {
      const result = await fetchRooms({
        size: PAGE_SIZE,
        lastId: pageParam,
      });

      if (!result.ok || !result.json) {
        throw new Error('Failed to fetch rooms');
      }

      if ('data' in result.json) {
        return result.json.data;
      }

      throw new Error('Invalid response format');
    },
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) => {
      if (!lastPage) return undefined;
      return lastPage.hasNext ? lastPage.lastId : undefined;
    },
  });
}
