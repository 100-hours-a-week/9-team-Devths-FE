import { useMutation } from '@tanstack/react-query';

import { uploadFile } from '@/lib/utils/uploadFile';

import type { UploadFileOptions } from '@/lib/utils/uploadFile';

export function useFileUpload() {
  return useMutation({
    mutationFn: async (options: UploadFileOptions) => {
      const result = await uploadFile(options);

      if (!result.ok) {
        throw new Error(result.error ?? 'File upload failed');
      }

      return result;
    },
  });
}
