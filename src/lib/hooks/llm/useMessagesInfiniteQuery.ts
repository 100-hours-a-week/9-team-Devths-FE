import { useInfiniteQuery } from '@tanstack/react-query';

import { fetchMessages } from '@/lib/api/llmRooms';
import { ApiError } from '@/lib/errors/ApiError';
import { llmKeys } from '@/lib/hooks/llm/queryKeys';

const PAGE_SIZE = 20;

export function useMessagesInfiniteQuery(roomId: number) {
  return useInfiniteQuery({
    queryKey: llmKeys.messages(roomId),
    queryFn: async ({ pageParam }) => {
      const result = await fetchMessages(roomId, {
        size: PAGE_SIZE,
        lastId: pageParam,
      });

      if (!result.json || !result.ok) {
        throw ApiError.fromResponse(result);
      }

      if ('data' in result.json) {
        return result.json.data;
      }

      throw new ApiError('Invalid response format', result.status);
    },
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) => {
      if (!lastPage) return undefined;
      return lastPage.hasNext ? lastPage.lastId : undefined;
    },
    enabled: roomId > 0,
  });
}
