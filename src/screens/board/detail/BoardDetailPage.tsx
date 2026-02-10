'use client';

import { Bell, Search } from 'lucide-react';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import PostContent from '@/components/board/detail/PostContent';
import PostHeader from '@/components/board/detail/PostHeader';
import ConfirmModal from '@/components/common/ConfirmModal';
import { useHeader } from '@/components/layout/HeaderContext';
import { useNavigationGuard } from '@/components/layout/NavigationGuardContext';
import { getUserIdFromAccessToken } from '@/lib/auth/token';
import { toast } from '@/lib/toast/store';

import type { BoardAuthor, BoardTag } from '@/types/board';

export default function BoardDetailPage() {
  const router = useRouter();
  const { setOptions, resetOptions } = useHeader();
  const { requestNavigation } = useNavigationGuard();
  const currentUserId = getUserIdFromAccessToken();
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const optionsButtonRef = useRef<HTMLButtonElement>(null);
  const optionsMenuRef = useRef<HTMLDivElement>(null);

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

  const mockPost = {
    postId: 1,
    title: '카카오 프론트엔드 1차 코딩 후기',
    content:
      '오늘 카카오 공채 1차 코딩테스트를 봤습니다. 3문제 출제됐고 난이도는 어려운 편이었습니다.',
    tags: ['코딩테스트'] as BoardTag[],
    createdAt: '2026-02-10T08:00:00.000Z',
    author: {
      userId: 1,
      nickname: '김개발',
      profileImageUrl: null,
      interests: ['프론트엔드'] as BoardAuthor['interests'],
    },
    stats: {
      likeCount: 124,
      commentCount: 23,
      shareCount: 8,
    },
  };
  const isAuthor = currentUserId !== null && currentUserId === mockPost.author.userId;

  const handleOptionsToggle = () => {
    if (!isAuthor) return;
    setIsOptionsOpen((prev) => !prev);
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


  return (
    <main className="px-3 pt-4 pb-6">
      <div className="space-y-3">
        <article className="rounded-2xl bg-white px-4 py-4 shadow-[0_6px_18px_rgba(15,23,42,0.06)]">
          <div className="relative">
            <PostHeader
              author={mockPost.author}
              createdAt={mockPost.createdAt}
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
          <PostContent title={mockPost.title} content={mockPost.content} tags={mockPost.tags} />

          <div className="mt-4 flex items-center gap-5 text-[11px] text-neutral-500">
            <button type="button" className="flex items-center gap-1" aria-label="좋아요">
              <Heart className="h-3.5 w-3.5" />
              <span>{mockPost.stats.likeCount}</span>
            </button>
            <div className="flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5" />
              <span>{mockPost.stats.commentCount}</span>
            </div>
            <button type="button" className="flex items-center gap-1" aria-label="공유">
              <Share2 className="h-3.5 w-3.5" />
              <span>{mockPost.stats.shareCount}</span>
            </button>
          </div>
        </article>

        <div className="rounded-xl bg-[#F1F5F9] px-3 py-2 text-xs text-neutral-500">
          개인정보(연락처, 계좌번호 등) 공유에 주의하세요
        </div>

        <section className="space-y-2">
          <p className="text-sm font-semibold text-neutral-800">댓글 3개</p>
          <div className="space-y-2">
            {[
              {
                id: 1,
                author: '김개발',
                time: '1시간 전',
                content: '정말 유용한 정보네요! 저도 도전해봐야겠어요',
              },
              {
                id: 2,
                author: '이백엔드',
                time: '2시간 전',
                content: '혹시 난이도는 어느정도였나요?',
              },
              {
                id: 3,
                author: '김개발',
                time: '1시간 전',
                content: '프로그래머스 Lv2~Lv3 정도였습니다',
              },
            ].map((comment) => (
              <div
                key={comment.id}
                className="rounded-2xl border border-neutral-100 bg-white px-3 py-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full border border-neutral-200 bg-neutral-200 text-[11px] font-semibold text-neutral-600">
                      {comment.author.slice(0, 1)}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-neutral-800">{comment.author}</div>
                      <div className="text-[11px] text-neutral-400">{comment.time}</div>
                    </div>
                  </div>
                </div>
                <p className="mt-2 text-xs text-neutral-600">{comment.content}</p>
              </div>
            ))}
          </div>
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
  );
}
