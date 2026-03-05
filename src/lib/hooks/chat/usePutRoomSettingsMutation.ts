import { useMutation, useQueryClient } from '@tanstack/react-query';

import { putRoomSettings } from '@/lib/api/chatRooms';
import { ApiError } from '@/lib/errors/ApiError';
import { chatKeys } from '@/lib/hooks/chat/queryKeys';

import type { PutRoomSettingsRequest } from '@/lib/api/chatRooms';

export function usePutRoomSettingsMutation(roomId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: PutRoomSettingsRequest) => {
      const result = await putRoomSettings(roomId, body);

      if (!result.ok) {
        throw ApiError.fromResponse(result);
      }

      return result;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: chatKeys.roomDetail(roomId) });
      void queryClient.invalidateQueries({ queryKey: chatKeys.all });
    },
  });
}
