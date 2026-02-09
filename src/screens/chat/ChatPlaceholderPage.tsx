'use client';

import { useEffect } from 'react';

import { useHeader } from '@/components/layout/HeaderContext';

export default function ChatPlaceholderPage() {
  const { setOptions, resetOptions } = useHeader();

  useEffect(() => {
    setOptions({
      title: '채팅',
      showBackButton: false,
    });

    return () => resetOptions();
  }, [resetOptions, setOptions]);

  return (
    <main className="px-3 pt-4 pb-3">
      <div className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-6 text-center text-sm text-neutral-500">
        채팅 화면 준비 중
      </div>
    </main>
  );
}
