import { useMutation, useQueryClient } from '@tanstack/react-query';

import { archiveRoom as archiveRoomApi } from '@/lib/api/llmRooms';
import { archiveRoom as archiveRoomStorage } from '@/lib/storage/aiChatroomStorage';

import type { FetchRoomsResponse } from '@/types/llm';
import type { InfiniteData } from '@tanstack/react-query';

const ROOMS_QUERY_KEY = ['llm', 'rooms'] as const;

export function useArchiveRoomMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roomId: string) => {
      const result = await archiveRoomApi(Number(roomId));
      return result;
    },
    onMutate: async (roomId) => {
      await queryClient.cancelQueries({ queryKey: ROOMS_QUERY_KEY });

      const previousData =
        queryClient.getQueryData<InfiniteData<FetchRoomsResponse>>(ROOMS_QUERY_KEY);

      queryClient.setQueryData<InfiniteData<FetchRoomsResponse>>(ROOMS_QUERY_KEY, (old) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            rooms: page.rooms.map((room) => {
              if (room.roomUuid === roomId) {
                archiveRoomStorage(roomId);
                return { ...room };
              }
              return room;
            }),
          })),
        };
      });

      return { previousData };
    },
    onError: (_error, _roomId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(ROOMS_QUERY_KEY, context.previousData);
      }
    },
    onSuccess: (result, roomId) => {
      if (result.ok) {
        archiveRoomStorage(roomId);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ROOMS_QUERY_KEY });
    },
  });
}
