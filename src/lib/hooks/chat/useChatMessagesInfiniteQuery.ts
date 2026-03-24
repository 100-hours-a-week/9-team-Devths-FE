import { useInfiniteQuery } from '@tanstack/react-query';

import { fetchChatMessages } from '@/lib/api/chatMessages';
import { ApiError } from '@/lib/errors/ApiError';
import { chatKeys } from '@/lib/hooks/chat/queryKeys';

const DEFAULT_PAGE_SIZE = 20;

type UseChatMessagesInfiniteQueryParams = Readonly<{
  roomId: number;
  size?: number;
}>;

export function useChatMessagesInfiniteQuery({
  roomId,
  size = DEFAULT_PAGE_SIZE,
}: UseChatMessagesInfiniteQueryParams) {
  return useInfiniteQuery({
    queryKey: chatKeys.messages({ roomId, size, lastId: null }),
    queryFn: async ({ pageParam }) => {
      const result = await fetchChatMessages(roomId, {
        size,
        lastId: pageParam,
      });

      if (!result.json || !result.ok) {
        throw ApiError.fromResponse(result);
      }

      if ('data' in result.json && result.json.data) {
        return result.json.data;
      }

      throw new ApiError('Invalid response format', result.status);
    },
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasNext) return undefined;
      return lastPage.nextCursor ?? undefined;
    },
    enabled: roomId > 0,
  });
}
