'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import { useHeader } from '@/components/layout/HeaderContext';
import LlmResultPage from '@/screens/llm/LlmResultPage';

export default function Page() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const roomId = params.roomId as string;
  const taskId = searchParams.get('taskId');
  const numericRoomId = Number(searchParams.get('rid')) || 0;
  const model = searchParams.get('model');
  const { setOptions, resetOptions } = useHeader();

  useEffect(() => {
    setOptions({
      title: '분석 결과',
      showBackButton: true,
      onBackClick: () => router.push(`/llm/${roomId}?rid=${numericRoomId}`),
    });

    return () => resetOptions();
  }, [resetOptions, roomId, numericRoomId, router, setOptions]);

  return (
    <LlmResultPage roomId={roomId} numericRoomId={numericRoomId} taskId={taskId} model={model} />
  );
}
