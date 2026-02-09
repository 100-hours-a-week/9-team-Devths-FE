'use client';

import { Bell, Plus, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import BoardPostCard from '@/components/board/BoardPostCard';
import BoardSortTabs from '@/components/board/BoardSortTabs';
import BoardTagFilter from '@/components/board/BoardTagFilter';
import BoardUserMiniProfile from '@/components/board/BoardUserMiniProfile';
import { useHeader } from '@/components/layout/HeaderContext';
import { useNavigationGuard } from '@/components/layout/NavigationGuardContext';
import ListLoadMoreSentinel from '@/components/llm/rooms/ListLoadMoreSentinel';
import { BOARD_TAG_MAX, POPULAR_MIN_LIKES } from '@/constants/board';
import { useBoardListInfiniteQuery } from '@/lib/hooks/boards/useBoardListInfiniteQuery';
import { useUnreadCountQuery } from '@/lib/hooks/notifications/useUnreadCountQuery';

import type { BoardSort, BoardTag } from '@/types/board';

const PAGE_SIZE = 10;

export default function BoardListPage() {
  const router = useRouter();
  const { setOptions, resetOptions } = useHeader();
  const { requestNavigation } = useNavigationGuard();
  const { data: unreadCount } = useUnreadCountQuery();
  const showBadge = typeof unreadCount === 'number' && unreadCount > 0;
  const [sort, setSort] = useState<BoardSort>('LATEST');
  const [selectedTags, setSelectedTags] = useState<BoardTag[]>([]);
  const [isTagOpen, setIsTagOpen] = useState(false);
  const [isMiniProfileOpen, setIsMiniProfileOpen] = useState(false);
  const [selectedAuthorId, setSelectedAuthorId] = useState<number | null>(null);

  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useBoardListInfiniteQuery({
      size: PAGE_SIZE,
      sort,
      tags: selectedTags,
    });

  const rawPosts = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data]);

  const filteredPosts = useMemo(() => {
    let filtered = rawPosts;

    if (selectedTags.length > 0) {
      filtered = filtered.filter((post) =>
        selectedTags.some((tag) => post.tags.includes(tag)),
      );
    }

    if (sort === 'POPULAR') {
      filtered = filtered
        .filter((post) => post.stats.likeCount >= POPULAR_MIN_LIKES)
        .sort((a, b) => {
          if (b.stats.likeCount !== a.stats.likeCount) {
            return b.stats.likeCount - a.stats.likeCount;
          }
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
    }

    return filtered;
  }, [rawPosts, selectedTags, sort]);

  const selectedAuthor = useMemo(
    () => rawPosts.find((post) => post.author.userId === selectedAuthorId)?.author ?? null,
    [rawPosts, selectedAuthorId],
  );

  const handleCreatePost = useCallback(() => {
    requestNavigation(() => router.push('/board/create'));
  }, [requestNavigation, router]);

  const handleSearchClick = useCallback(() => {
    requestNavigation(() => router.push('/board/search'));
  }, [requestNavigation, router]);

  const handleNotificationsClick = useCallback(() => {
    requestNavigation(() => router.push('/notifications'));
  }, [requestNavigation, router]);

  const handleAuthorClick = (userId: number) => {
    setSelectedAuthorId(userId);
    setIsMiniProfileOpen(true);
  };

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
  ]);

  return (
    <>
      <main className="px-3 pt-4 pb-3">
        <div className="flex flex-col gap-3">
          <BoardSortTabs value={sort} onChange={setSort} />
          <BoardTagFilter
            open={isTagOpen}
            onToggleOpen={() => setIsTagOpen((prev) => !prev)}
            selected={selectedTags}
            onChangeSelected={setSelectedTags}
            max={BOARD_TAG_MAX}
          />
        </div>

        <div className="mt-4 space-y-3">
          {isLoading ? (
            <div className="rounded-2xl bg-white px-4 py-6 text-center text-sm text-neutral-500 shadow-[0_6px_18px_rgba(15,23,42,0.06)]">
              게시글을 불러오는 중...
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
          ) : filteredPosts.length === 0 ? (
            <div className="rounded-2xl bg-white px-4 py-6 text-center text-sm text-neutral-500 shadow-[0_6px_18px_rgba(15,23,42,0.06)]">
              {selectedTags.length > 0
                ? '선택한 태그에 해당하는 글이 없어요.'
                : '아직 게시글이 없어요.'}
            </div>
          ) : (
            <>
              {filteredPosts.map((post) => (
                <BoardPostCard key={post.postId} post={post} onAuthorClick={handleAuthorClick} />
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
        user={
          selectedAuthor
            ? {
                userId: selectedAuthor.userId,
                nickname: selectedAuthor.nickname,
                profileImageUrl: selectedAuthor.profileImageUrl ?? null,
                interests: selectedAuthor.interests ?? [],
              }
            : null
        }
        onStartChat={() => setIsMiniProfileOpen(false)}
        onToggleFollow={() => setIsMiniProfileOpen(false)}
      />
    </>
  );
}
