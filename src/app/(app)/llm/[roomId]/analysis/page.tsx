'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useHeader } from '@/components/layout/HeaderContext';
import LlmAnalysisPage from '@/screens/llm/LlmAnalysisPage';

export default function Page() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.roomId as string;
  const { setOptions, resetOptions } = useHeader();

  useEffect(() => {
    setOptions({
      title: 'AI 분석',
      showBackButton: true,
      onBackClick: () => router.push(`/llm/${roomId}`),
    });

    return () => resetOptions();
  }, [resetOptions, roomId, router, setOptions]);

  return <LlmAnalysisPage roomId={roomId} />;
}
