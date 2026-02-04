import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteFile } from '@/lib/api/files';
import { userKeys } from '@/lib/hooks/users/queryKeys';

type DeleteProfileImageInput = {
  fileId: number;
};

export function useDeleteProfileImageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ fileId }: DeleteProfileImageInput) => {
      const result = await deleteFile(fileId);

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
