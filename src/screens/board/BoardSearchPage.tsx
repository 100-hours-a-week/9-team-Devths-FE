'use client';

import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';

import { useHeader } from '@/components/layout/HeaderContext';

export default function BoardSearchPage() {
  const router = useRouter();
  const { setOptions, resetOptions } = useHeader();

  const handleBackClick = useCallback(() => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }
    router.push('/board');
  }, [router]);

  useEffect(() => {
    setOptions({
      title: '게시글 검색',
      showBackButton: true,
      onBackClick: handleBackClick,
    });

    return () => resetOptions();
  }, [handleBackClick, resetOptions, setOptions]);

  return (
    <main className="px-3 pt-4 pb-3">
      <div className="space-y-4">
        <section className="rounded-2xl bg-white px-4 py-4 shadow-[0_6px_18px_rgba(15,23,42,0.06)]">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search"
              disabled
              className="h-10 w-full rounded-xl border border-neutral-200 bg-neutral-50 pr-3 pl-9 text-sm text-neutral-500 outline-none"
            />
          </div>
          <p className="mt-2 text-xs text-neutral-400">검색어를 입력해 주세요.</p>
        </section>

        <section className="rounded-2xl bg-white px-4 py-4 shadow-[0_6px_18px_rgba(15,23,42,0.06)]">
          <p className="text-sm font-semibold text-neutral-900">최근 검색어</p>
          <p className="mt-2 text-xs text-neutral-500">최근 검색어 영역</p>
        </section>

        <section className="rounded-2xl bg-white px-4 py-4 shadow-[0_6px_18px_rgba(15,23,42,0.06)]">
          <p className="text-sm font-semibold text-neutral-900">게시글 (0)</p>
          <div className="mt-3 rounded-xl border border-dashed border-neutral-200 px-3 py-6 text-center text-xs text-neutral-500">
            검색 결과 영역
          </div>
        </section>
      </div>
    </main>
  );
}
