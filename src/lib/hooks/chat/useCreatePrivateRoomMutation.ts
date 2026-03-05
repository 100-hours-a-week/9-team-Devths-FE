import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createPrivateChatRoom } from '@/lib/api/chatRooms';
import { ApiError } from '@/lib/errors/ApiError';
import { chatKeys } from '@/lib/hooks/chat/queryKeys';

import type { PrivateChatRoomCreateRequest } from '@/lib/api/chatRooms';

export function useCreatePrivateRoomMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: PrivateChatRoomCreateRequest) => {
      const result = await createPrivateChatRoom(body);

      if (!result.ok) {
        throw ApiError.fromResponse(result);
      }

      return result;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: chatKeys.all });
      void queryClient.invalidateQueries({ queryKey: chatKeys.rooms() });
      void queryClient.refetchQueries({ queryKey: chatKeys.rooms(), type: 'all' });
    },
  });
}
