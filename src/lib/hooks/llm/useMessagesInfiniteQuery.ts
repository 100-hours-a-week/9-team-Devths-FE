import { useInfiniteQuery } from '@tanstack/react-query';

import { fetchMessages } from '@/lib/api/llmRooms';
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

      if (!result.json) {
        const error = new Error('Failed to fetch messages');
        (error as Error & { status?: number }).status = result.status;
        throw error;
      }

      if (!result.ok) {
        const message =
          'message' in result.json && typeof result.json.message === 'string'
            ? result.json.message
            : 'Failed to fetch messages';
        const error = new Error(message);
        (error as Error & { status?: number }).status = result.status;
        throw error;
      }

      if ('data' in result.json) {
        return result.json.data;
      }

      const error = new Error('Invalid response format');
      (error as Error & { status?: number }).status = result.status;
      throw error;
    },
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) => {
      if (!lastPage) return undefined;
      return lastPage.hasNext ? lastPage.lastId : undefined;
    },
    enabled: roomId > 0,
  });
}
