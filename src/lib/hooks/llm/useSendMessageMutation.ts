import { useMutation, useQueryClient } from '@tanstack/react-query';

import { sendMessage } from '@/lib/api/llmRooms';
import { llmKeys } from '@/lib/hooks/llm/queryKeys';

import type { SendMessageRequest } from '@/types/llm';

export function useSendMessageMutation(roomId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: SendMessageRequest) => {
      const result = await sendMessage(roomId, request);

      if (!result.ok || !result.json) {
        throw new Error('Failed to send message');
      }

      if ('data' in result.json) {
        return result.json.data;
      }

      throw new Error('Invalid response format');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: llmKeys.messages(roomId) });
    },
  });
}
