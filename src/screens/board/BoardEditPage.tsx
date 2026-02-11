'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo } from 'react';

import { useHeader } from '@/components/layout/HeaderContext';

export default function BoardEditPage() {
  const router = useRouter();
  const params = useParams();
  const { setOptions, resetOptions } = useHeader();
  const postIdParam = Array.isArray(params?.postId) ? params.postId[0] : params?.postId;
  const postId = postIdParam ? Number(postIdParam) : null;

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
    setOptions({
      title: '게시글 수정',
      showBackButton: true,
      onBackClick: handleBackClick,
      rightSlot,
    });

    return () => resetOptions();
  }, [handleBackClick, resetOptions, rightSlot, setOptions]);

  return (
    <main className="px-3 pt-4 pb-3">
      <div className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-6 text-center text-sm text-neutral-500">
        게시글 수정 화면 준비 중
      </div>
    </main>
  );
}
