import { useInfiniteQuery } from '@tanstack/react-query';

import { fetchRooms } from '@/lib/api/llmRooms';
import { llmKeys } from '@/lib/hooks/llm/queryKeys';

const PAGE_SIZE = 10;

export function useRoomsInfiniteQuery() {
  return useInfiniteQuery({
    queryKey: llmKeys.rooms(),
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
