import { useMutation, useQueryClient } from '@tanstack/react-query';

import { unfollowUser } from '@/lib/api/users';
import { ApiError } from '@/lib/errors/ApiError';
import { userKeys } from '@/lib/hooks/users/queryKeys';

export function useUnfollowUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: number) => {
      const result = await unfollowUser(userId);

      if (!result.ok) {
        throw ApiError.fromResponse(result);
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}
