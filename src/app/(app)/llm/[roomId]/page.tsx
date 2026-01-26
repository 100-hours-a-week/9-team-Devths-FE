'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useHeader } from '@/components/layout/HeaderContext';
import LlmChatPage from '@/screens/llm/LlmChatPage';

export default function Page() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.roomId as string;
  const { setOptions, resetOptions } = useHeader();

  useEffect(() => {
    setOptions({
      title: roomId,
      showBackButton: true,
      onBackClick: () => router.push('/llm'),
    });

    return () => resetOptions();
  }, [resetOptions, roomId, router, setOptions]);

  return <LlmChatPage roomId={roomId} />;
}
