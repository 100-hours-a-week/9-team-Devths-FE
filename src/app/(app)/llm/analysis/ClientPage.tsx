'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useHeader } from '@/components/layout/HeaderContext';
import LlmAnalysisPage from '@/screens/llm/LlmAnalysisPage';

export default function ClientPage() {
  const router = useRouter();
  const { setOptions, resetOptions } = useHeader();

  useEffect(() => {
    setOptions({
      title: 'AI 분석',
      showBackButton: true,
      onBackClick: () => router.push('/llm'),
    });

    return () => resetOptions();
  }, [resetOptions, router, setOptions]);

  const roomId = 'new';

  return <LlmAnalysisPage roomId={roomId} />;
}
