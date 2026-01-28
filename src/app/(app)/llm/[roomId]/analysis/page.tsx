'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import { useHeader } from '@/components/layout/HeaderContext';
import LlmAnalysisPage from '@/screens/llm/LlmAnalysisPage';

export default function Page() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const roomId = params.roomId as string;
  const numericRoomId = Number(searchParams.get('rid')) || 0;
  const { setOptions, resetOptions } = useHeader();

  useEffect(() => {
    setOptions({
      title: 'AI 분석',
      showBackButton: true,
      onBackClick: () => router.push(`/llm/${roomId}?rid=${numericRoomId}`),
    });

    return () => resetOptions();
  }, [resetOptions, roomId, numericRoomId, router, setOptions]);

  return <LlmAnalysisPage roomId={roomId} numericRoomId={numericRoomId} />;
}
