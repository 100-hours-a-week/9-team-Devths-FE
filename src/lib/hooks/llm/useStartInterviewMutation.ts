import { useMutation, useQueryClient } from '@tanstack/react-query';

import { startInterview } from '@/lib/api/llmRooms';
import { llmKeys } from '@/lib/hooks/llm/queryKeys';

import type { InterviewType, LlmModel } from '@/types/llm';

export function useStartInterviewMutation(roomId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { interviewType: InterviewType; model: LlmModel }) => {
      const result = await startInterview(roomId, payload);

      if (!result.ok || !result.json) {
        throw new Error('Failed to start interview');
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
