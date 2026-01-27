import { useMutation, useQueryClient } from '@tanstack/react-query';

import { endInterview } from '@/lib/api/llmRooms';
import { llmKeys } from '@/lib/hooks/llm/queryKeys';

export function useEndInterviewMutation(roomId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (interviewId: number) => {
      const result = await endInterview(roomId, { interviewId });

      if (!result.ok || !result.json) {
        throw new Error('Failed to end interview');
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
