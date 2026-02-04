import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteRoom as deleteRoomApi } from '@/lib/api/llmRooms';
import { llmKeys } from '@/lib/hooks/llm/queryKeys';
import { removeRoomStorage } from '@/lib/storage/aiChatroomStorage';

import type { FetchRoomsResponse } from '@/types/llm';
import type { InfiniteData } from '@tanstack/react-query';

export function useDeleteRoomMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roomId: number) => {
      const result = await deleteRoomApi(roomId);
      return result;
    },
    onMutate: async (roomId) => {
      await queryClient.cancelQueries({ queryKey: llmKeys.rooms() });

      const previousData = queryClient.getQueryData<InfiniteData<FetchRoomsResponse>>(
        llmKeys.rooms(),
      );

      queryClient.setQueryData<InfiniteData<FetchRoomsResponse>>(llmKeys.rooms(), (old) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            rooms: page.rooms.filter((room) => room.roomId !== roomId),
          })),
        };
      });

      if (previousData) {
        const targetRoom = previousData.pages
          .flatMap((page) => page.rooms)
          .find((room) => room.roomId === roomId);

        if (targetRoom) {
          removeRoomStorage(targetRoom.roomUuid);
        }
      }

      return { previousData };
    },
    onError: (_error, _roomId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(llmKeys.rooms(), context.previousData);
      }
    },
    onSuccess: (result, roomId, context) => {
      if (result.ok && context?.previousData) {
        const targetRoom = context.previousData.pages
          .flatMap((page) => page.rooms)
          .find((room) => room.roomId === roomId);

        if (targetRoom) {
          removeRoomStorage(targetRoom.roomUuid);
        }
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: llmKeys.rooms() });
    },
  });
}
