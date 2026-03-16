'use client';

import { useQuery } from '@tanstack/react-query';
import { Bell, Loader2, Plus, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import BoardPostCard from '@/components/board/BoardPostCard';
import BoardSortTabs from '@/components/board/BoardSortTabs';
import BoardTagFilter from '@/components/board/BoardTagFilter';
import BoardUserMiniProfile from '@/components/board/BoardUserMiniProfile';
import { useHeader } from '@/components/layout/HeaderContext';
import { useNavigationGuard } from '@/components/layout/NavigationGuardContext';
import ListLoadMoreSentinel from '@/components/llm/rooms/ListLoadMoreSentinel';
import {
  BOARD_PAGE_SIZE,
  BOARD_TAG_MAX,
  FOLLOWINGS_FETCH_SIZE,
  PULL_MAX,
  PULL_THRESHOLD,
} from '@/constants/board';
import { fetchMyFollowings } from '@/lib/api/users';
import { getUserIdFromAccessToken } from '@/lib/auth/token';
import { useBoardListInfiniteQuery } from '@/lib/hooks/boards/useBoardListInfiniteQuery';
import { useBoardMiniProfile } from '@/lib/hooks/boards/useBoardMiniProfile';
import { useFilteredPosts } from '@/lib/hooks/boards/useFilteredPosts';
import { useUnreadCountQuery } from '@/lib/hooks/notifications/useUnreadCountQuery';
import { userKeys } from '@/lib/hooks/users/queryKeys';

import type { BoardSort, BoardTag } from '@/types/board';

export default function BoardListPage() {
  const router = useRouter();
  const currentUserId = getUserIdFromAccessToken();
  const { setOptions, resetOptions } = useHeader();
  const { requestNavigation } = useNavigationGuard();
  const { data: unreadCount } = useUnreadCountQuery();
  const showBadge = typeof unreadCount === 'number' && unreadCount > 0;
  const [sort, setSort] = useState<BoardSort>('LATEST');
  const [selectedTags, setSelectedTags] = useState<BoardTag[]>([]);
  const [isTagOpen, setIsTagOpen] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isReadyToRefresh, setIsReadyToRefresh] = useState(false);
  const isRefreshingRef = useRef(false);
  const isReadyToRefreshRef = useRef(false);

  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useBoardListInfiniteQuery({
      size: BOARD_PAGE_SIZE,
      sort,
      tags: selectedTags,
    });

  const rawPosts = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data]);

  const {
    isMiniProfileOpen,
    setIsMiniProfileOpen,
    modalUser,
    modalUserId,
    isMine,
    isFollowing,
    isFollowPending,
    handleAuthorClick,
    handleToggleFollow,
  } = useBoardMiniProfile({ rawPosts, currentUserId });

  const {
    data: followingAuthorIds,
    isLoading: isFollowingAuthorIdsLoading,
    isError: isFollowingAuthorIdsError,
    refetch: refetchFollowingAuthorIds,
  } = useQuery({
    queryKey: [...userKeys.all, 'myFollowingAuthorIds'],
    queryFn: async () => {
      const ids = new Set<number>();
      let lastId: number | null | undefined = undefined;

      while (true) {
        const result = await fetchMyFollowings({
          size: FOLLOWINGS_FETCH_SIZE,
          lastId,
        });

        if (!result.ok || !result.json) {
          throw new Error('Failed to fetch my following users');
        }

        if (!('data' in result.json) || !result.json.data) {
          throw new Error('Invalid response format');
        }

        for (const following of result.json.data.followings) {
          ids.add(following.userId);
        }

        if (!result.json.data.hasNext || result.json.data.lastId === null) {
          break;
        }

        lastId = result.json.data.lastId;
      }

      return Array.from(ids);
    },
    enabled: sort === 'FOLLOWING',
  });

  const filteredPosts = useFilteredPosts(rawPosts, { sort, selectedTags, followingAuthorIds });

  const handleCreatePost = useCallback(() => {
    requestNavigation(() => router.push('/board/create'));
  }, [requestNavigation, router]);

  const handleSearchClick = useCallback(() => {
    requestNavigation(() => router.push('/board/search'));
  }, [requestNavigation, router]);

  const handleNotificationsClick = useCallback(() => {
    requestNavigation(() => router.push('/notifications'));
  }, [requestNavigation, router]);

  const handlePostClick = useCallback(
    (postId: number) => {
      requestNavigation(() => router.push(`/board/${postId}`));
    },
    [requestNavigation, router],
  );

  const triggerRefresh = useCallback(async () => {
    if (isRefreshingRef.current) return;
    isRefreshingRef.current = true;
    setIsRefreshing(true);
    setPullDistance(PULL_THRESHOLD);
    try {
      await refetch();
    } finally {
      isRefreshingRef.current = false;
      isReadyToRefreshRef.current = false;
      setIsRefreshing(false);
      setIsReadyToRefresh(false);
      setPullDistance(0);
    }
  }, [refetch]);

  const rightSlot = useMemo(
    () => (
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={handleSearchClick}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-neutral-100"
          aria-label="게시글 검색"
        >
          <Search className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={handleNotificationsClick}
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-neutral-100"
          aria-label="알림"
        >
          <Bell className="h-5 w-5" />
          {showBadge ? (
            <span className="absolute top-[0.5px] right-[0.5px] h-2.5 w-2.5 rounded-full bg-red-500" />
          ) : null}
        </button>
      </div>
    ),
    [handleNotificationsClick, handleSearchClick, showBadge],
  );

  useEffect(() => {
    setOptions({
      title: 'Devths',
      showBackButton: false,
      rightSlot,
    });

    return () => resetOptions();
  }, [resetOptions, rightSlot, setOptions]);

  useEffect(() => {
    if (isLoading || isError) return;
    if (sort === 'FOLLOWING' && isFollowingAuthorIdsLoading) return;
    if (sort === 'FOLLOWING' && isFollowingAuthorIdsError) return;
    if (sort === 'FOLLOWING' && followingAuthorIds && followingAuthorIds.length === 0) return;
    if (!hasNextPage || isFetchingNextPage) return;
    if (filteredPosts.length > 0) return;
    void fetchNextPage();
  }, [
    fetchNextPage,
    filteredPosts.length,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isLoading,
    sort,
    isFollowingAuthorIdsLoading,
    isFollowingAuthorIdsError,
    followingAuthorIds,
  ]);

  useEffect(() => {
    const getScrollTop = () =>
      window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;

    let startY = 0;
    let tracking = false;

    const handleTouchStart = (event: TouchEvent) => {
      if (isRefreshingRef.current) return;
      if (getScrollTop() > 1) return;
      const touch = event.touches[0];
      if (!touch) return;
      tracking = true;
      startY = touch.clientY;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!tracking) return;
      const touch = event.touches[0];
      if (!touch) return;
      const delta = touch.clientY - startY;
      if (delta <= 0) {
        setPullDistance(0);
        setIsPulling(false);
        isReadyToRefreshRef.current = false;
        setIsReadyToRefresh(false);
        return;
      }
      if (getScrollTop() > 1) {
        setIsPulling(false);
        return;
      }
      const distance = Math.min(delta * 0.6, PULL_MAX);
      setPullDistance(distance);
      setIsPulling(true);
      isReadyToRefreshRef.current = distance >= PULL_THRESHOLD;
      setIsReadyToRefresh(isReadyToRefreshRef.current);
      if (event.cancelable) event.preventDefault();
    };

    const handleTouchEnd = () => {
      if (!tracking) return;
      tracking = false;
      setIsPulling(false);
      if (isReadyToRefreshRef.current) {
        void triggerRefresh();
        return;
      }
      setPullDistance(0);
      isReadyToRefreshRef.current = false;
      setIsReadyToRefresh(false);
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [triggerRefresh]);

  return (
    <>
      <main className="px-3 pt-4 pb-3">
        <div className="flex flex-col gap-3">
          <BoardSortTabs
            value={sort}
            onChange={(next) => {
              if (typeof document !== 'undefined' && 'startViewTransition' in document) {
                document.startViewTransition(() => setSort(next));
              } else {
                setSort(next);
              }
            }}
          />
          <BoardTagFilter
            open={isTagOpen}
            onToggleOpen={() => setIsTagOpen((prev) => !prev)}
            selected={selectedTags}
            onChangeSelected={(next) => {
              if (typeof document !== 'undefined' && 'startViewTransition' in document) {
                document.startViewTransition(() => setSelectedTags(next));
              } else {
                setSelectedTags(next);
              }
            }}
            max={BOARD_TAG_MAX}
          />
        </div>

        <div className="relative mt-4">
          <div
            className="absolute right-0 left-0 flex items-center justify-center gap-2 text-xs text-neutral-500"
            style={{
              transform: `translateY(${Math.min(pullDistance, PULL_THRESHOLD)}px)`,
              opacity: pullDistance > 0 || isRefreshing ? 1 : 0,
              transition: isPulling ? 'none' : 'opacity 150ms ease, transform 150ms ease',
            }}
          >
            <Loader2 className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>
              {isRefreshing
                ? '새로고침 중...'
                : isReadyToRefresh
                  ? '놓으면 새로고침'
                  : '당겨서 새로고침'}
            </span>
          </div>

          <div
            className="space-y-3"
            style={{
              transform: pullDistance ? `translateY(${pullDistance}px)` : undefined,
              transition: isPulling || isRefreshing ? 'none' : 'transform 180ms ease',
            }}
          >
            {isLoading ? (
              <div className="space-y-3" aria-busy="true" aria-label="게시글 불러오는 중">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-2xl bg-white px-4 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)]"
                  >
                    <div className="flex gap-3">
                      <div className="h-10 w-10 flex-shrink-0 rounded-full bg-neutral-200" />
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="h-3.5 w-20 rounded bg-neutral-200" />
                          <div className="h-3 w-12 rounded bg-neutral-100" />
                        </div>
                        <div className="h-3 w-24 rounded bg-neutral-100" />
                        <div className="mt-2 h-4 w-3/4 rounded bg-neutral-200" />
                        <div className="h-3.5 w-full rounded bg-neutral-100" />
                        <div className="h-3.5 w-2/3 rounded bg-neutral-100" />
                        <div className="mt-1 flex gap-1.5">
                          <div className="h-5 w-14 rounded-full bg-neutral-100" />
                          <div className="h-5 w-16 rounded-full bg-neutral-100" />
                        </div>
                        <div className="mt-1 flex gap-3">
                          <div className="h-3 w-10 rounded bg-neutral-100" />
                          <div className="h-3 w-10 rounded bg-neutral-100" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : isError ? (
              <div className="rounded-2xl bg-white px-4 py-6 text-center text-sm text-neutral-500 shadow-[0_6px_18px_rgba(15,23,42,0.06)]">
                <p>네트워크 오류가 발생했어요.</p>
                <button
                  type="button"
                  onClick={() => void refetch()}
                  className="mt-3 rounded-full border border-neutral-200 bg-white px-4 py-1 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                >
                  다시 시도
                </button>
              </div>
            ) : sort === 'FOLLOWING' && isFollowingAuthorIdsLoading ? (
              <div className="space-y-3" aria-busy="true" aria-label="팔로잉 목록 불러오는 중">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-2xl bg-white px-4 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)]"
                  >
                    <div className="flex gap-3">
                      <div className="h-10 w-10 flex-shrink-0 rounded-full bg-neutral-200" />
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="h-3.5 w-20 rounded bg-neutral-200" />
                          <div className="h-3 w-12 rounded bg-neutral-100" />
                        </div>
                        <div className="h-3 w-24 rounded bg-neutral-100" />
                        <div className="mt-2 h-4 w-3/4 rounded bg-neutral-200" />
                        <div className="h-3.5 w-full rounded bg-neutral-100" />
                        <div className="h-3.5 w-2/3 rounded bg-neutral-100" />
                        <div className="mt-1 flex gap-1.5">
                          <div className="h-5 w-14 rounded-full bg-neutral-100" />
                          <div className="h-5 w-16 rounded-full bg-neutral-100" />
                        </div>
                        <div className="mt-1 flex gap-3">
                          <div className="h-3 w-10 rounded bg-neutral-100" />
                          <div className="h-3 w-10 rounded bg-neutral-100" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : sort === 'FOLLOWING' && isFollowingAuthorIdsError ? (
              <div className="rounded-2xl bg-white px-4 py-6 text-center text-sm text-neutral-500 shadow-[0_6px_18px_rgba(15,23,42,0.06)]">
                <p>팔로잉 목록을 불러오지 못했어요.</p>
                <button
                  type="button"
                  onClick={() => void refetchFollowingAuthorIds()}
                  className="mt-3 rounded-full border border-neutral-200 bg-white px-4 py-1 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                >
                  다시 시도
                </button>
              </div>
            ) : filteredPosts.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-neutral-500">
                {sort === 'FOLLOWING'
                  ? (followingAuthorIds?.length ?? 0) === 0
                    ? '아직 팔로우한 사용자가 없어요.'
                    : '팔로우한 사용자의 게시글이 없어요.'
                  : selectedTags.length > 0
                    ? '선택한 태그에 해당하는 글이 없어요.'
                    : '아직 게시글이 없어요.'}
              </p>
            ) : (
              <>
                {filteredPosts.map((post, index) => (
                  <BoardPostCard
                    key={post.postId}
                    post={post}
                    onClick={handlePostClick}
                    onAuthorClick={handleAuthorClick}
                    priority={index < 3}
                  />
                ))}
                <div className="px-4 pt-2">
                  <ListLoadMoreSentinel
                    onLoadMore={() => void fetchNextPage()}
                    hasNextPage={hasNextPage ?? false}
                    isFetchingNextPage={isFetchingNextPage}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <div className="fixed bottom-[calc(var(--bottom-nav-h)+16px)] left-1/2 z-50 w-full max-w-[430px] -translate-x-1/2 px-4 sm:px-6">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleCreatePost}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-b from-[#1CD48A] to-[#05C075] text-white shadow-[0_12px_24px_rgba(5,192,117,0.35)] ring-1 ring-white/60 transition hover:scale-105 hover:from-[#2DE09A] hover:to-[#07B374] active:translate-y-0.5"
            aria-label="게시글 작성"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>

      <BoardUserMiniProfile
        open={isMiniProfileOpen}
        onClose={() => setIsMiniProfileOpen(false)}
        user={modalUser}
        isMine={isMine}
        isFollowing={isFollowing}
        isFollowPending={isFollowPending}
        onGoMyPage={() => {
          setIsMiniProfileOpen(false);
          requestNavigation(() => router.push('/profile'));
        }}
        onStartChat={() => {
          if (modalUserId === null || isMine) return;
          setIsMiniProfileOpen(false);
          const params = new URLSearchParams();
          params.set('targetUserId', String(modalUserId));
          params.set('from', 'board');
          if (modalUser?.nickname) {
            params.set('targetNickname', modalUser.nickname);
          }
          requestNavigation(() => router.push(`/chat?${params.toString()}`));
        }}
        onToggleFollow={() => void handleToggleFollow()}
      />
    </>
  );
}
