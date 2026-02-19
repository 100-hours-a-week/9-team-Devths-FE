import { useMutation, useQueryClient } from '@tanstack/react-query';

import { leaveChatRoom } from '@/lib/api/chatRooms';
import { chatKeys } from '@/lib/hooks/chat/queryKeys';

export function useLeaveChatRoomMutation(roomId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const result = await leaveChatRoom(roomId);

      if (!result.ok) {
        const error = new Error('Failed to leave chat room') as Error & {
          status?: number;
          serverMessage?: string;
        };
        error.status = result.status;

        if (result.json && 'message' in result.json) {
          error.serverMessage = result.json.message;
        }

        throw error;
      }

      return result;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: chatKeys.rooms() });
      await queryClient.invalidateQueries({ queryKey: chatKeys.roomDetail(roomId) });
      await queryClient.invalidateQueries({ queryKey: chatKeys.all });
    },
  });
}
