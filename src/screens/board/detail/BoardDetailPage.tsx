'use client';

import { Bell, Heart, MessageCircle, Search, Share2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import BoardShareModal from '@/components/board/detail/BoardShareModal';
import CommentList from '@/components/board/detail/CommentList';
import PostContent from '@/components/board/detail/PostContent';
import PostHeader from '@/components/board/detail/PostHeader';
import ConfirmModal from '@/components/common/ConfirmModal';
import { useHeader } from '@/components/layout/HeaderContext';
import { useNavigationGuard } from '@/components/layout/NavigationGuardContext';
import { likeBoardPost, unlikeBoardPost } from '@/lib/api/boards';
import { getUserIdFromAccessToken } from '@/lib/auth/token';
import { useBoardCommentsQuery } from '@/lib/hooks/boards/useBoardCommentsQuery';
import { useBoardDetailQuery } from '@/lib/hooks/boards/useBoardDetailQuery';
import { toast } from '@/lib/toast/store';
import { formatCountCompact } from '@/lib/utils/board';
import { groupCommentsByThread } from '@/lib/utils/comments';
import BoardPostDetailSkeleton from '@/screens/board/detail/BoardPostDetailSkeleton';

export default function BoardDetailPage() {
  const router = useRouter();
  const { setOptions, resetOptions } = useHeader();
  const { requestNavigation } = useNavigationGuard();
  const params = useParams();
  const postIdParam = Array.isArray(params?.postId) ? params?.postId[0] : params?.postId;
  const postId = postIdParam ? Number(postIdParam) : null;
  const currentUserId = getUserIdFromAccessToken();
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [likeOverride, setLikeOverride] = useState<{
    postId: number;
    isLiked: boolean;
    likeCount: number;
  } | null>(null);
  const [isLikePending, setIsLikePending] = useState(false);
  const optionsButtonRef = useRef<HTMLButtonElement>(null);
  const optionsMenuRef = useRef<HTMLDivElement>(null);
  const {
    data: post,
    isLoading,
    isError,
    refetch,
  } = useBoardDetailQuery(Number.isFinite(postId) ? postId : null);
  const {
    data: commentsPage,
    isLoading: isCommentsLoading,
    isError: isCommentsError,
    refetch: refetchComments,
  } = useBoardCommentsQuery(Number.isFinite(postId) ? postId : null, 50);

  const handleSearchClick = useCallback(() => {
    requestNavigation(() => router.push('/board/search'));
  }, [requestNavigation, router]);

  const handleNotificationsClick = useCallback(() => {
    requestNavigation(() => router.push('/notifications'));
  }, [requestNavigation, router]);

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
          className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-neutral-100"
          aria-label="알림"
        >
          <Bell className="h-5 w-5" />
        </button>
      </div>
    ),
    [handleNotificationsClick, handleSearchClick],
  );

  useEffect(() => {
    setOptions({
      title: 'Devths',
      showBackButton: false,
      rightSlot,
    });

    return () => resetOptions();
  }, [resetOptions, rightSlot, setOptions]);

  const isAuthor = Boolean(post && currentUserId !== null && currentUserId === post.author.userId);

  const handleOptionsToggle = () => {
    if (!isAuthor) return;
    setIsOptionsOpen((prev) => !prev);
  };

  const handleLikeToggle = async () => {
    if (!post) return;
    if (isLikePending) return;

    const resolvedIsLiked =
      likeOverride?.postId === post.postId ? likeOverride.isLiked : post.isLiked;
    const resolvedLikeCount =
      likeOverride?.postId === post.postId ? likeOverride.likeCount : post.stats.likeCount;
    const nextLiked = !resolvedIsLiked;
    const nextCount = nextLiked ? resolvedLikeCount + 1 : Math.max(0, resolvedLikeCount - 1);

    setLikeOverride({ postId: post.postId, isLiked: nextLiked, likeCount: nextCount });
    setIsLikePending(true);

    try {
      if (nextLiked) {
        const result = await likeBoardPost(post.postId);
        if (result?.likeCount !== undefined) {
          setLikeOverride({
            postId: post.postId,
            isLiked: true,
            likeCount: result.likeCount,
          });
        }
      } else {
        await unlikeBoardPost(post.postId);
      }
    } catch (error) {
      setLikeOverride({
        postId: post.postId,
        isLiked: resolvedIsLiked,
        likeCount: resolvedLikeCount,
      });
      toast(error instanceof Error ? error.message : '좋아요 처리에 실패했습니다.');
    } finally {
      setIsLikePending(false);
    }
  };

  const handleEditClick = () => {
    setIsOptionsOpen(false);
    toast('게시글 수정은 준비 중입니다.');
  };

  const handleDeleteClick = () => {
    setIsOptionsOpen(false);
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    setIsDeleteConfirmOpen(false);
  };

  const handleDeleteCancel = () => {
    setIsDeleteConfirmOpen(false);
  };

  const handleShareOpen = () => {
    setIsShareOpen(true);
  };

  const handleShareClose = () => {
    setIsShareOpen(false);
  };

  const handleShareCopy = () => {
    setIsShareOpen(false);
  };

  useEffect(() => {
    if (!isOptionsOpen) return;

    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (optionsMenuRef.current?.contains(target)) return;
      if (optionsButtonRef.current?.contains(target)) return;
      setIsOptionsOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOptionsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOptionsOpen]);

  if (isLoading) {
    return <BoardPostDetailSkeleton />;
  }

  if (isError || !post) {
    return (
      <main className="px-3 pt-4 pb-6">
        <div className="rounded-2xl bg-white px-4 py-6 text-center text-sm text-neutral-500 shadow-[0_6px_18px_rgba(15,23,42,0.06)]">
          <p>게시글을 불러오지 못했습니다.</p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="mt-3 rounded-full border border-neutral-200 bg-white px-4 py-1 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
          >
            다시 시도
          </button>
        </div>
      </main>
    );
  }

  const resolvedIsLiked =
    likeOverride?.postId === post.postId ? likeOverride.isLiked : post.isLiked;
  const resolvedLikeCount =
    likeOverride?.postId === post.postId ? likeOverride.likeCount : post.stats.likeCount;
  const commentThreads = groupCommentsByThread(commentsPage?.items ?? []);
  const shareUrl =
    typeof window === 'undefined'
      ? ''
      : `${window.location.origin}/board/${encodeURIComponent(post.postId)}`;

  return (
    <>
      <main
        className="px-3 pt-4 pb-6"
        style={{ paddingBottom: 'calc(var(--bottom-nav-h) + 88px)' }}
      >
        <div className="space-y-3">
          <article className="rounded-2xl bg-white px-4 py-4 shadow-[0_6px_18px_rgba(15,23,42,0.06)]">
            <div className="relative">
              <PostHeader
                author={post.author}
                createdAt={post.createdAt}
                showOptions={isAuthor}
                onOptionsClick={handleOptionsToggle}
                optionsButtonRef={optionsButtonRef}
              />
              {isAuthor && isOptionsOpen ? (
                <div
                  ref={optionsMenuRef}
                  className="absolute top-9 right-0 z-10 w-32 rounded-xl border border-neutral-200 bg-white py-1 text-sm text-neutral-700 shadow-[0_10px_30px_rgba(15,23,42,0.12)]"
                >
                  <button
                    type="button"
                    onClick={handleEditClick}
                    className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-neutral-50"
                  >
                    수정
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteClick}
                    className="flex w-full items-center justify-between px-3 py-2 text-left text-red-500 hover:bg-red-50"
                  >
                    삭제
                  </button>
                </div>
              ) : null}
            </div>
            <PostContent title={post.title} content={post.content} tags={post.tags} />

            <div className="mt-4 flex items-center gap-5 text-[11px] text-neutral-500">
              <button
                type="button"
                className={`flex items-center gap-1 ${
                  resolvedIsLiked ? 'text-[#05C075]' : 'text-neutral-500'
                }`}
                aria-label="좋아요"
                onClick={handleLikeToggle}
              >
                <Heart className={`h-3.5 w-3.5 ${resolvedIsLiked ? 'fill-[#05C075]' : ''}`} />
                <span>{formatCountCompact(resolvedLikeCount)}</span>
              </button>
              <div className="flex items-center gap-1">
                <MessageCircle className="h-3.5 w-3.5" />
                <span>{formatCountCompact(post.stats.commentCount)}</span>
              </div>
            <button
              type="button"
              className="flex items-center gap-1"
              aria-label="공유"
              onClick={handleShareOpen}
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>{formatCountCompact(post.stats.shareCount)}</span>
            </button>
            </div>
          </article>

          <section className="space-y-2">
            <p className="text-sm font-semibold text-neutral-800">
              댓글 {formatCountCompact(post.stats.commentCount)}개
            </p>
            {isCommentsLoading ? (
              <p className="rounded-2xl bg-white px-4 py-4 text-center text-xs text-neutral-500">
                댓글을 불러오는 중...
              </p>
            ) : isCommentsError ? (
              <div className="rounded-2xl bg-white px-4 py-4 text-center text-xs text-neutral-500">
                <p>댓글을 불러오지 못했습니다.</p>
                <button
                  type="button"
                  onClick={() => void refetchComments()}
                  className="mt-3 rounded-full border border-neutral-200 bg-white px-3 py-1 text-[11px] font-semibold text-neutral-700 hover:bg-neutral-50"
                >
                  다시 시도
                </button>
              </div>
            ) : (
              <CommentList threads={commentThreads} />
            )}
          </section>
        </div>

        <ConfirmModal
          isOpen={isDeleteConfirmOpen}
          title="게시글 삭제"
          message="게시글을 삭제할까요? 삭제된 게시글은 복구할 수 없습니다."
          confirmText="삭제"
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      </main>
      <BoardShareModal
        open={isShareOpen}
        onClose={handleShareClose}
        shareUrl={shareUrl}
        onCopy={handleShareCopy}
      />
      <div className="fixed bottom-[calc(var(--bottom-nav-h)+12px)] left-1/2 z-40 w-full max-w-[430px] -translate-x-1/2 px-4 sm:px-6">
        <div className="rounded-xl bg-[#F1F5F9] px-3 py-2 text-xs text-neutral-500 shadow-[0_8px_20px_rgba(15,23,42,0.08)]">
          개인정보(연락처, 계좌번호 등) 공유에 주의하세요
        </div>
      </div>
    </>
  );
}
