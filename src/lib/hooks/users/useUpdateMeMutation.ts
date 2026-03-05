import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateMe } from '@/lib/api/users';
import { ApiError } from '@/lib/errors/ApiError';
import { userKeys } from '@/lib/hooks/users/queryKeys';

import type { UpdateMeRequest } from '@/lib/api/users';

export function useUpdateMeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: UpdateMeRequest) => {
      const result = await updateMe(body);

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
