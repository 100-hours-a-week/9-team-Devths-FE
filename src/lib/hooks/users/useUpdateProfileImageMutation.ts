import { useMutation, useQueryClient } from '@tanstack/react-query';

import { uploadFile } from '@/lib/upload/uploadFile';
import { userKeys } from '@/lib/hooks/users/queryKeys';

type UploadProfileImageInput = {
  file: File;
  userId: number;
};

export function useUploadProfileImageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, userId }: UploadProfileImageInput) => {
      if (!userId) {
        throw new Error('유저 정보를 확인할 수 없습니다.');
      }

      return uploadFile({
        file,
        category: null,
        refType: 'USER',
        refId: userId,
        sortOrder: 0,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.me() });
    },
  });
}
