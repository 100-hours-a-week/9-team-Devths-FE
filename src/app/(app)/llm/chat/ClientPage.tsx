'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';

import { useHeader } from '@/components/layout/HeaderContext';
import LlmChatPage from '@/screens/llm/LlmChatPage';

export default function ClientPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = useMemo(() => searchParams.get('roomId') ?? 'demo-room', [searchParams]);
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
