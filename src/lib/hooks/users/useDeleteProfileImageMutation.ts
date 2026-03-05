import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteFile } from '@/lib/api/files';
import { ApiError } from '@/lib/errors/ApiError';
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
        throw ApiError.fromResponse(result);
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.me() });
    },
  });
}
