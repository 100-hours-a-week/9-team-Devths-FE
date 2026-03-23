'use client';

import { useQueryClient } from '@tanstack/react-query';
import { Pencil } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import BoardPostCard from '@/components/board/BoardPostCard';
import ConfirmModal from '@/components/common/ConfirmModal';
import { useHeader } from '@/components/layout/HeaderContext';
import EditProfileModal from '@/components/mypage/EditProfileModal';
import WithdrawModal from '@/components/mypage/WithdrawModal';
import { postLogout } from '@/lib/api/auth';
import {
  clearAccessToken,
  clearLoggingOut,
  getUserIdFromAccessToken,
  markLoggingOut,
} from '@/lib/auth/token';
import { useAccessibilityMode } from '@/lib/hooks/accessibility/useAccessibilityMode';
import {
  unregisterFcmToken,
  usePushNotificationToggle,
} from '@/lib/hooks/notifications/useFcmToken';
import { useMeQuery } from '@/lib/hooks/users/useMeQuery';
import { useMyCommentsInfiniteQuery } from '@/lib/hooks/users/useMyCommentsInfiniteQuery';
import { useMyPostsInfiniteQuery } from '@/lib/hooks/users/useMyPostsInfiniteQuery';
import { toast } from '@/lib/toast/store';
import { formatCountToK } from '@/lib/utils/number';

import type { BoardPostSummary } from '@/types/board';

export default function MyPageScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setOptions, resetOptions } = useHeader();
  const { isOn: isAccessibilityOn, toggle: toggleAccessibility } = useAccessibilityMode();
  const { data, isLoading, isError } = useMeQuery();
  const {
    data: myPostsData,
    isLoading: isMyPostsLoading,
    isError: isMyPostsError,
    hasNextPage: isMyPostsHasNextPage,
    isFetchingNextPage: isMyPostsFetchingNextPage,
    fetchNextPage: fetchMyPostsNextPage,
  } = useMyPostsInfiniteQuery({ size: 5 });
  const {
    data: myCommentsData,
    isLoading: isMyCommentsLoading,
    isError: isMyCommentsError,
    hasNextPage: isMyCommentsHasNextPage,
    isFetchingNextPage: isMyCommentsFetchingNextPage,
    fetchNextPage: fetchMyCommentsNextPage,
  } = useMyCommentsInfiniteQuery({ size: 5 });
  const [activeContentTab, setActiveContentTab] = useState<'posts' | 'comments'>('posts');
  const infiniteScrollTriggerRef = useRef<HTMLDivElement | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const {
    isActive: isPushActive,
    isPending: isPushPending,
    toggle: togglePush,
    isSupported: isPushSupported,
  } = usePushNotificationToggle();

  useEffect(() => {
    setOptions({
      showAccessibilityButton: true,
      accessibilityActive: isAccessibilityOn,
      onAccessibilityClick: toggleAccessibility,
    });

    return () => resetOptions();
  }, [isAccessibilityOn, resetOptions, setOptions, toggleAccessibility]);

  const handleWithdraw = () => {
    setIsEditOpen(false);
    setIsWithdrawOpen(true);
  };

  const handleLogoutOpen = () => {
    setIsEditOpen(false);
    setIsLogoutConfirmOpen(true);
  };

  const handleLogoutCancel = () => {
    if (isLoggingOut) return;
    setIsLogoutConfirmOpen(false);
  };

  const handleLogoutConfirm = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    markLoggingOut();
    try {
      const isFcmUnregistered = await unregisterFcmToken();
      if (!isFcmUnregistered) {
        toast('푸시 알림 해제에 실패했지만 로그아웃은 계속 진행합니다.');
      }
      const result = await postLogout();
      if (!result.ok && result.status !== 401) {
        throw new Error('로그아웃에 실패했습니다.');
      }
      clearAccessToken();
      queryClient.clear();
      router.replace('/');
    } catch {
      clearLoggingOut();
      toast('로그아웃에 실패했습니다.');
      setIsLoggingOut(false);
    }
  };

  const followerCount = data?.stats.followerCount ?? 0;
  const followingCount = data?.stats.followingCount ?? 0;

  const handleMoveFollowers = () => {
    router.push('/profile/follows?tab=followers');
  };

  const handleMoveFollowings = () => {
    router.push('/profile/follows?tab=followings');
  };

  const myPosts = myPostsData?.pages.flatMap((page) => page.posts) ?? [];
  const myComments = myCommentsData?.pages.flatMap((page) => page.comments) ?? [];
  const myNicknameInitial = Array.from((data?.nickname ?? '').trim())[0]?.toUpperCase() ?? '?';
  const myPostCards: BoardPostSummary[] = myPosts.map((post) => ({
    postId: post.id,
    title: post.title,
    preview: post.content,
    tags: [],
    createdAt: post.createdAt,
    author: {
      userId: getUserIdFromAccessToken() ?? -1,
      nickname: data?.nickname ?? '나',
      profileImageUrl: data?.profileImage?.url ?? null,
      interests: [],
    },
    stats: {
      likeCount: post.likeCount,
      commentCount: post.commentCount,
      shareCount: post.shareCount,
    },
  }));

  const formatDateTime = (isoDate: string) => {
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) return '-';

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');

    return `${yyyy}.${mm}.${dd} ${hh}:${min}`;
  };

  const handleMovePostDetail = (postId: number) => {
    router.push(`/board/${postId}`);
  };

  const handleMoveCommentPostDetail = (postId: number) => {
    router.push(`/board/${postId}`);
  };

  useEffect(() => {
    const target = infiniteScrollTriggerRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;

        if (activeContentTab === 'posts') {
          if (!isMyPostsHasNextPage || isMyPostsFetchingNextPage) return;
          void fetchMyPostsNextPage();
          return;
        }

        if (!isMyCommentsHasNextPage || isMyCommentsFetchingNextPage) return;
        void fetchMyCommentsNextPage();
      },
      { rootMargin: '120px 0px' },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [
    activeContentTab,
    isMyPostsHasNextPage,
    isMyPostsFetchingNextPage,
    isMyCommentsHasNextPage,
    isMyCommentsFetchingNextPage,
    fetchMyPostsNextPage,
    fetchMyCommentsNextPage,
  ]);

  return (
    <main className="flex flex-col px-6 py-4">
      <section className="-mx-6 mt-2 bg-white px-6 py-4">
        {isLoading ? (
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 animate-pulse rounded-full bg-neutral-200" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-24 animate-pulse rounded bg-neutral-200" />
              <div className="h-4 w-32 animate-pulse rounded bg-neutral-200" />
            </div>
          </div>
        ) : isError ? (
          <p className="text-sm text-red-500">프로필을 불러오지 못했습니다.</p>
        ) : (
          <div className="space-y-4">
            <div
              className={
                isAccessibilityOn ? 'flex flex-col items-start gap-4' : 'flex items-center gap-4'
              }
            >
              {data?.profileImage?.url ? (
                <Image
                  src={data.profileImage.url}
                  alt="프로필"
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black text-2xl font-semibold text-white">
                  {myNicknameInitial}
                </div>
              )}

              <div className="flex-1">
                <p className="text-lg font-semibold text-neutral-900">{data?.nickname}</p>
                {data?.interests && data.interests.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {data.interests.map((tag) => {
                      const normalized = tag.toLowerCase();
                      const mappedTag =
                        normalized === '프론트엔드' ||
                        normalized === 'frontend' ||
                        normalized === 'fe'
                          ? 'FE'
                          : normalized === '백엔드' ||
                              normalized === 'backend' ||
                              normalized === 'be'
                            ? 'BE'
                            : normalized === '클라우드' || normalized === 'cloud'
                              ? 'CLOUD'
                              : normalized === 'ai' || normalized === '인공지능'
                                ? 'AI'
                                : tag;

                      return (
                        <span
                          key={tag}
                          className="justify-self-start rounded-full bg-neutral-100 px-3 py-1 text-center text-[11px] font-semibold whitespace-nowrap text-neutral-700"
                        >
                          #{mappedTag}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              <div
                className={
                  isAccessibilityOn
                    ? 'flex w-full flex-wrap items-center gap-2'
                    : 'flex flex-col items-end gap-2'
                }
              >
                <button
                  type="button"
                  onClick={() => setIsEditOpen(true)}
                  className="flex items-center gap-1 rounded-full bg-[#05C075] px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-[#04A865]"
                >
                  <Pencil aria-hidden="true" className="h-4 w-4" />
                  프로필 수정
                </button>
                <button
                  type="button"
                  onClick={handleLogoutOpen}
                  className="rounded-full border border-[#05C075] bg-white px-3 py-1.5 text-xs font-semibold text-[#05C075] shadow-sm hover:bg-[#E9F9F1]"
                >
                  로그아웃
                </button>
              </div>
            </div>

            <div
              className={
                isAccessibilityOn ? 'grid grid-cols-1 bg-white' : 'grid grid-cols-2 bg-white'
              }
            >
              <button
                type="button"
                onClick={handleMoveFollowers}
                className={
                  isAccessibilityOn
                    ? 'border-b border-neutral-200 bg-white px-3 py-3 text-center hover:bg-neutral-50'
                    : 'border-r border-neutral-200 bg-white px-3 py-2 text-center hover:bg-neutral-50'
                }
                aria-label="팔로워 목록 보기"
              >
                <p className="text-[11px] text-neutral-500">팔로워</p>
                <p className="mt-1 text-sm font-semibold text-neutral-900">
                  {formatCountToK(followerCount)}
                </p>
              </button>
              <button
                type="button"
                onClick={handleMoveFollowings}
                className="bg-white px-3 py-2 text-center hover:bg-neutral-50"
                aria-label="팔로잉 목록 보기"
              >
                <p className="text-[11px] text-neutral-500">팔로잉</p>
                <p className="mt-1 text-sm font-semibold text-neutral-900">
                  {formatCountToK(followingCount)}
                </p>
              </button>
            </div>

            {isPushSupported ? (
              <div
                className={
                  isAccessibilityOn
                    ? 'flex flex-col items-start gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3'
                    : 'flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3'
                }
              >
                <div>
                  <p className="text-sm font-semibold text-neutral-900">푸시 알림</p>
                  <p className="text-xs text-neutral-500">새 알림을 푸시로 받습니다</p>
                </div>
                <div className="flex items-center gap-2">
                  {isAccessibilityOn ? (
                    <span className="text-xs font-medium text-neutral-600" aria-live="polite">
                      {isPushActive ? '켜짐' : '꺼짐'}
                    </span>
                  ) : null}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isPushActive}
                    aria-label={`푸시 알림 ${isPushActive ? '켜짐' : '꺼짐'}`}
                    onClick={() => void togglePush()}
                    disabled={isPushPending}
                    className={`relative h-6 w-11 rounded-full transition-colors disabled:opacity-50 ${isPushActive ? 'bg-[#05C075]' : 'bg-neutral-300'}`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${isPushActive ? 'translate-x-5' : 'translate-x-0'}`}
                    />
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </section>

      <section className="mt-0 flex flex-1 flex-col rounded-2xl bg-white px-0 py-4">
        <div className="relative rounded-xl border border-[#05C075]/30 bg-white p-1">
          {!isAccessibilityOn ? (
            <span
              className={`pointer-events-none absolute top-1 left-1 h-[calc(100%-8px)] w-[calc(50%-4px)] rounded-lg bg-[#05C075] shadow-sm transition-transform duration-200 ${
                activeContentTab === 'posts' ? 'translate-x-0' : 'translate-x-full'
              }`}
            />
          ) : null}
          <div role="tablist" aria-label="내 활동" className="relative grid grid-cols-2 gap-1">
            <button
              type="button"
              role="tab"
              aria-selected={activeContentTab === 'posts'}
              aria-controls="mypage-panel-posts"
              id="mypage-tab-posts"
              onClick={() => setActiveContentTab('posts')}
              className={`rounded-lg px-1 py-2 text-sm font-semibold transition-colors ${
                isAccessibilityOn
                  ? activeContentTab === 'posts'
                    ? 'bg-[#05C075] text-white'
                    : 'bg-white text-neutral-700 hover:bg-neutral-50'
                  : activeContentTab === 'posts'
                    ? 'text-white'
                    : 'text-neutral-500 hover:text-[#0B6A42]'
              }`}
            >
              내가 쓴 글
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeContentTab === 'comments'}
              aria-controls="mypage-panel-comments"
              id="mypage-tab-comments"
              onClick={() => setActiveContentTab('comments')}
              className={`rounded-lg px-1 py-2 text-sm font-semibold transition-colors ${
                isAccessibilityOn
                  ? activeContentTab === 'comments'
                    ? 'bg-[#05C075] text-white'
                    : 'bg-white text-neutral-700 hover:bg-neutral-50'
                  : activeContentTab === 'comments'
                    ? 'text-white'
                    : 'text-neutral-500 hover:text-[#0B6A42]'
              }`}
            >
              내가 쓴 댓글
            </button>
          </div>
        </div>

        <div
          role="tabpanel"
          id="mypage-panel-posts"
          aria-labelledby="mypage-tab-posts"
          className="mt-4 space-y-2"
          hidden={activeContentTab !== 'posts'}
        >
          {isMyPostsLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3"
              >
                <div className="h-4 w-40 animate-pulse rounded bg-neutral-200" />
                <div className="mt-2 h-3 w-28 animate-pulse rounded bg-neutral-200" />
              </div>
            ))
          ) : isMyPostsError ? (
            <p className="py-8 text-center text-sm text-red-500">
              내가 쓴 글 목록을 불러오지 못했습니다.
            </p>
          ) : (
            <>
              {myPosts.length === 0 ? (
                <p className="py-8 text-center text-sm text-neutral-500">
                  아직 작성한 게시글이 없습니다.
                </p>
              ) : (
                myPostCards.map((post) => (
                  <BoardPostCard key={post.postId} post={post} onClick={handleMovePostDetail} />
                ))
              )}
              {isMyPostsHasNextPage ? <div ref={infiniteScrollTriggerRef} className="h-1" /> : null}
              {isMyPostsFetchingNextPage ? (
                <p className="py-2 text-center text-xs text-neutral-400">게시글을 불러오는 중...</p>
              ) : null}
            </>
          )}
        </div>
        <div
          role="tabpanel"
          id="mypage-panel-comments"
          aria-labelledby="mypage-tab-comments"
          className="mt-4 space-y-2"
          hidden={activeContentTab !== 'comments'}
        >
          {isMyCommentsLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3"
              >
                <div className="h-4 w-40 animate-pulse rounded bg-neutral-200" />
                <div className="mt-2 h-3 w-28 animate-pulse rounded bg-neutral-200" />
              </div>
            ))
          ) : isMyCommentsError ? (
            <p className="py-8 text-center text-sm text-red-500">
              내가 쓴 댓글 목록을 불러오지 못했습니다.
            </p>
          ) : (
            <>
              {myComments.length === 0 ? (
                <p className="py-8 text-center text-sm text-neutral-500">
                  아직 작성한 댓글이 없습니다.
                </p>
              ) : (
                myComments.map((comment) => (
                  <button
                    key={comment.id}
                    type="button"
                    onClick={() => handleMoveCommentPostDetail(comment.postId)}
                    className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-left hover:border-[#05C075]"
                  >
                    <p className="line-clamp-1 text-sm font-semibold text-neutral-900">
                      {comment.postTitle}
                    </p>
                    <p className="mt-1 line-clamp-1 text-xs text-neutral-600">{comment.content}</p>
                    <p className="mt-1 text-xs text-neutral-500">
                      {formatDateTime(comment.createdAt)}
                    </p>
                  </button>
                ))
              )}
              {isMyCommentsHasNextPage ? (
                <div ref={infiniteScrollTriggerRef} className="h-1" />
              ) : null}
              {isMyCommentsFetchingNextPage ? (
                <p className="py-2 text-center text-xs text-neutral-400">댓글을 불러오는 중...</p>
              ) : null}
            </>
          )}
        </div>
      </section>

      <EditProfileModal
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onWithdraw={handleWithdraw}
        initialData={data}
      />

      <ConfirmModal
        isOpen={isLogoutConfirmOpen}
        title="로그아웃"
        message="로그아웃 하시겠습니까?"
        confirmText="확인"
        cancelText="취소"
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
      />

      <WithdrawModal
        open={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        nickname={data?.nickname ?? ''}
      />
    </main>
  );
}
