import { useMutation, useQueryClient } from '@tanstack/react-query';

import { postPresigned } from '@/lib/api/files';
import { updateProfileImage } from '@/lib/api/users';
import { userKeys } from '@/lib/hooks/users/queryKeys';

import type { PresignedData } from '@/lib/api/files';

type UploadProfileImageInput = {
  file: File;
};

export function useUpdateProfileImageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file }: UploadProfileImageInput) => {
      const presignedResult = await postPresigned({
        fileName: file.name,
        mimeType: file.type,
      });

      const presignedData = presignedResult.json?.data as PresignedData | null | undefined;

      if (!presignedResult.ok || !presignedData) {
        throw new Error('Failed to get presigned URL');
      }

      const { presignedUrl, s3Key } = presignedData;

      const s3Response = await fetch(presignedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      if (!s3Response.ok) {
        throw new Error('Failed to upload to S3');
      }

      const result = await updateProfileImage({ s3Key });

      if (!result.ok) {
        const error = new Error('Failed to update profile image') as Error & {
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
