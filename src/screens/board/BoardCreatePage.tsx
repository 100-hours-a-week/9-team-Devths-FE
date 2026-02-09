'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo } from 'react';

import { useHeader } from '@/components/layout/HeaderContext';

export default function BoardCreatePage() {
  const router = useRouter();
  const { setOptions, resetOptions } = useHeader();

  const handleBackClick = useCallback(() => {
    router.push('/board');
  }, [router]);

  const rightSlot = useMemo(
    () => (
      <button
        type="button"
        disabled
        className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-semibold text-neutral-400"
      >
        등록
      </button>
    ),
    [],
  );

  useEffect(() => {
    setOptions({
      title: '게시글 작성',
      showBackButton: true,
      onBackClick: handleBackClick,
      rightSlot,
    });

    return () => resetOptions();
  }, [handleBackClick, resetOptions, rightSlot, setOptions]);

  return (
    <main className="px-3 pt-4 pb-6">
      <section className="sticky top-14 z-10 rounded-2xl bg-neutral-50 px-4 py-3 text-xs text-neutral-600">
        연락처, 계좌번호, 주민번호 등 개인정보 공유를 삼가해 주세요.
      </section>

      <section className="mt-4 space-y-4">
        <div className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-4 text-sm text-neutral-400">
          제목/내용/태그/첨부 영역이 여기에 들어갈 예정입니다.
        </div>
      </section>
    </main>
  );
}
