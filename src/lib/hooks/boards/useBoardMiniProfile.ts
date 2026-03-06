import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { fetchUserProfile } from '@/lib/api/users';
import { ApiError } from '@/lib/errors/ApiError';
import { userKeys } from '@/lib/hooks/users/queryKeys';
import { useFollowUserMutation } from '@/lib/hooks/users/useFollowUserMutation';
import { useUnfollowUserMutation } from '@/lib/hooks/users/useUnfollowUserMutation';
import { toast } from '@/lib/toast/store';

import type { BoardPostSummary } from '@/types/board';

type Params = {
  rawPosts: BoardPostSummary[];
  currentUserId: number | null;
};

export function useBoardMiniProfile({ rawPosts, currentUserId }: Params) {
  const [isMiniProfileOpen, setIsMiniProfileOpen] = useState(false);
  const [selectedAuthorId, setSelectedAuthorId] = useState<number | null>(null);
  const [followStateOverrides, setFollowStateOverrides] = useState<Record<number, boolean>>({});

  const followMutation = useFollowUserMutation();
  const unfollowMutation = useUnfollowUserMutation();

  const selectedAuthor = useMemo(
    () => rawPosts.find((post) => post.author.userId === selectedAuthorId)?.author ?? null,
    [rawPosts, selectedAuthorId],
  );

  const { data: selectedAuthorProfile, refetch: refetchSelectedAuthorProfile } = useQuery({
    queryKey: userKeys.profile(selectedAuthorId ?? -1),
    queryFn: async () => {
      const result = await fetchUserProfile(selectedAuthorId!);

      if (!result.ok || !result.json) {
        throw new Error('Failed to fetch user profile');
      }

      if ('data' in result.json && result.json.data) {
        return result.json.data;
      }

      throw new Error('Invalid response format');
    },
    enabled: selectedAuthorId !== null,
  });

  const modalUser = selectedAuthor
    ? {
        userId: selectedAuthor.userId,
        nickname: selectedAuthorProfile?.user.nickname ?? selectedAuthor.nickname,
        profileImageUrl:
          selectedAuthorProfile?.profileImage?.url ?? selectedAuthor.profileImageUrl ?? null,
        interests: selectedAuthorProfile?.interests ?? selectedAuthor.interests ?? [],
      }
    : null;

  const modalUserId = modalUser?.userId ?? null;
  const isMine = Boolean(
    modalUserId !== null && currentUserId !== null && modalUserId === currentUserId,
  );
  const profileIsFollowing = selectedAuthorProfile?.isFollowing ?? false;
  const isFollowing =
    modalUserId !== null && followStateOverrides[modalUserId] !== undefined
      ? followStateOverrides[modalUserId]
      : profileIsFollowing;
  const isFollowPending = followMutation.isPending || unfollowMutation.isPending;

  const handleAuthorClick = (userId: number) => {
    setSelectedAuthorId(userId);
    setIsMiniProfileOpen(true);
  };

  const handleToggleFollow = async () => {
    if (modalUserId === null || isMine || isFollowPending) return;

    try {
      if (isFollowing) {
        await unfollowMutation.mutateAsync(modalUserId);
        setFollowStateOverrides((prev) => ({ ...prev, [modalUserId]: false }));
      } else {
        await followMutation.mutateAsync(modalUserId);
        setFollowStateOverrides((prev) => ({ ...prev, [modalUserId]: true }));
      }
      void refetchSelectedAuthorProfile();
    } catch (error) {
      const err = ApiError.fromUnknown(error);
      toast(err.serverMessage ?? '팔로우 처리에 실패했습니다.');
    }
  };

  return {
    isMiniProfileOpen,
    setIsMiniProfileOpen,
    modalUser,
    modalUserId,
    isMine,
    isFollowing,
    isFollowPending,
    handleAuthorClick,
    handleToggleFollow,
  };
}
