'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import { useHeader } from '@/components/layout/HeaderContext';
import LlmChatPage from '@/screens/llm/LlmChatPage';

export default function Page() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const roomId = params.roomId as string;
  const numericRoomId = Number(searchParams.get('rid')) || 0;
  const model = searchParams.get('model');
  const { setOptions, resetOptions } = useHeader();

  useEffect(() => {
    setOptions({
      title: roomId,
      showBackButton: true,
      onBackClick: () => router.push('/llm'),
    });

    return () => resetOptions();
  }, [resetOptions, roomId, router, setOptions]);

  return <LlmChatPage roomId={roomId} numericRoomId={numericRoomId} initialModel={model} />;
}
