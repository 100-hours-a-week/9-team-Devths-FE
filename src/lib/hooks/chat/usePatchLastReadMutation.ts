import { useMutation, useQueryClient } from '@tanstack/react-query';

import { patchLastRead } from '@/lib/api/chatRooms';
import { ApiError } from '@/lib/errors/ApiError';
import { chatKeys } from '@/lib/hooks/chat/queryKeys';

export function usePatchLastReadMutation(roomId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (lastReadMsgId: number) => {
      const result = await patchLastRead(roomId, { lastReadMsgId });

      if (!result.ok) {
        throw ApiError.fromResponse(result);
      }

      return result;
    },
    onSuccess: () => {
      queryClient.setQueryData<Record<number, boolean>>(chatKeys.realtimeUnreadRooms(), (prev) => {
        if (roomId <= 0) {
          return prev ?? {};
        }

        return {
          ...(prev ?? {}),
          [roomId]: false,
        };
      });
      void queryClient.invalidateQueries({ queryKey: chatKeys.rooms() });
    },
  });
}
