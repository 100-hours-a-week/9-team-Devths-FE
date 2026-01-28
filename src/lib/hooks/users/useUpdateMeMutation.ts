import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateMe } from '@/lib/api/users';
import { userKeys } from '@/lib/hooks/users/queryKeys';

import type { UpdateMeRequest } from '@/lib/api/users';

export function useUpdateMeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: UpdateMeRequest) => {
      const result = await updateMe(body);

      if (!result.ok) {
        const error = new Error('Failed to update profile') as Error & {
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.me() });
    },
  });
}
