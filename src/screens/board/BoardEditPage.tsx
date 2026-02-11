'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useHeader } from '@/components/layout/HeaderContext';
import { useBoardDetailQuery } from '@/lib/hooks/boards/useBoardDetailQuery';

import type { BoardTag } from '@/types/board';

export default function BoardEditPage() {
  const router = useRouter();
  const params = useParams();
  const { setOptions, resetOptions } = useHeader();
  const postIdParam = Array.isArray(params?.postId) ? params.postId[0] : params?.postId;
  const postId = useMemo(() => {
    if (!postIdParam) return null;
    const parsed = Number(postIdParam);
    return Number.isFinite(parsed) ? parsed : null;
  }, [postIdParam]);
  const { data: post, isLoading, isError, refetch } = useBoardDetailQuery(postId);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<BoardTag[]>([]);
  const didBindInitialRef = useRef(false);

  const handleBackClick = useCallback(() => {
    if (!postId || !Number.isFinite(postId)) {
      router.push('/board');
      return;
    }
    router.push(`/board/${postId}`);
  }, [postId, router]);

  const rightSlot = useMemo(
    () => (
      <button
        type="button"
        disabled
        className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-semibold text-neutral-400"
      >
        저장
      </button>
    ),
    [],
  );

  useEffect(() => {
    didBindInitialRef.current = false;
    setTitle('');
    setContent('');
    setTags([]);
  }, [postId]);

  useEffect(() => {
    if (!post) return;
    if (didBindInitialRef.current) return;

    setTitle(post.title);
    setContent(post.content);
    setTags(post.tags);
    didBindInitialRef.current = true;
  }, [post]);

  useEffect(() => {
    setOptions({
      title: '게시글 수정',
      showBackButton: true,
      onBackClick: handleBackClick,
      rightSlot,
    });

    return () => resetOptions();
  }, [handleBackClick, resetOptions, rightSlot, setOptions]);

  if (!postId) {
    return (
      <main className="px-3 pt-4 pb-3">
        <div className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-6 text-center text-sm text-neutral-500">
          유효하지 않은 게시글입니다.
        </div>
      </main>
    );
  }

  if (isLoading && !didBindInitialRef.current) {
    return (
      <main className="px-3 pt-4 pb-3">
        <div className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-6 text-center text-sm text-neutral-500">
          게시글 정보를 불러오는 중...
        </div>
      </main>
    );
  }

  if (isError && !post) {
    return (
      <main className="px-3 pt-4 pb-3">
        <div className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-6 text-center text-sm text-neutral-500">
          <p>게시글 정보를 불러오지 못했습니다.</p>
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

  return (
    <main className="px-3 pt-4 pb-3">
      <div className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-[0_6px_18px_rgba(15,23,42,0.06)]">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-neutral-700">제목</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="rounded-xl border border-neutral-200 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-[#05C075]"
            placeholder="제목을 입력하세요"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-neutral-700">내용</span>
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            className="min-h-40 rounded-xl border border-neutral-200 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-[#05C075]"
            placeholder="내용을 입력하세요"
          />
        </label>

        <div className="flex flex-wrap gap-2">
          {tags.length > 0 ? (
            tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setTags((prev) => prev.filter((item) => item !== tag));
                }}
                className="rounded-full bg-[#E6F9F1] px-3 py-1 text-xs font-semibold text-[#05C075]"
              >
                {tag}
              </button>
            ))
          ) : (
            <p className="text-xs text-neutral-500">선택된 태그 없음</p>
          )}
        </div>
      </div>
    </main>
  );
}
