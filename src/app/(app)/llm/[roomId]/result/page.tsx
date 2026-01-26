'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useHeader } from '@/components/layout/HeaderContext';
import LlmResultPage from '@/screens/llm/LlmResultPage';

export default function Page() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.roomId as string;
  const { setOptions, resetOptions } = useHeader();

  useEffect(() => {
    setOptions({
      title: '분석 결과',
      showBackButton: true,
      onBackClick: () => router.push(`/llm/${roomId}`),
    });

    return () => resetOptions();
  }, [resetOptions, roomId, router, setOptions]);

  return <LlmResultPage roomId={roomId} />;
}
