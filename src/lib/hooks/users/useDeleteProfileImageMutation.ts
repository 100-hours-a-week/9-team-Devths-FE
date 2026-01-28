import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteProfileImage } from '@/lib/api/users';
import { userKeys } from '@/lib/hooks/users/queryKeys';

export function useDeleteProfileImageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const result = await deleteProfileImage();

      if (!result.ok) {
        const error = new Error('Failed to delete profile image') as Error & {
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
