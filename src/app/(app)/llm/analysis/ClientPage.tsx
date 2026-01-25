'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';

import { useHeader } from '@/components/layout/HeaderContext';
import LlmAnalysisPage from '@/screens/llm/LlmAnalysisPage';

export default function ClientPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = useMemo(() => searchParams.get('roomId') ?? 'demo-room', [searchParams]);
  const { setOptions, resetOptions } = useHeader();

  useEffect(() => {
    setOptions({
      title: 'AI 분석',
      showBackButton: true,
      onBackClick: () => router.back(),
    });

    return () => resetOptions();
  }, [resetOptions, router, setOptions]);

  return <LlmAnalysisPage />;
}
