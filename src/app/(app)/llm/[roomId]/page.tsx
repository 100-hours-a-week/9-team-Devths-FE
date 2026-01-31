'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo } from 'react';

import { useHeader } from '@/components/layout/HeaderContext';
import { useRoomsInfiniteQuery } from '@/lib/hooks/llm/useRoomsInfiniteQuery';
import { useAnalysisTaskStore } from '@/lib/llm/analysisTaskStore';
import LlmChatPage from '@/screens/llm/LlmChatPage';

export default function Page() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const roomId = params.roomId as string;
  const numericRoomId = Number(searchParams.get('rid')) || 0;
  const model = searchParams.get('model');
  const { setOptions, resetOptions } = useHeader();
  const { data } = useRoomsInfiniteQuery();
  const activeTask = useAnalysisTaskStore((state) => state.activeTask);

  const resolvedTitle = useMemo(() => {
    if (activeTask) {
      const isActiveRoom = activeTask.roomId === numericRoomId || activeTask.roomUuid === roomId;
      if (isActiveRoom && activeTask.roomTitle) return activeTask.roomTitle;
    }

    const rooms = data?.pages.flatMap((page) => (page ? page.rooms : [])) ?? [];
    const matched = rooms.find((room) => room.roomId === numericRoomId || room.roomUuid === roomId);
    if (matched?.title) return matched.title;

    return roomId;
  }, [activeTask, data?.pages, numericRoomId, roomId]);

  useEffect(() => {
    setOptions({
      title: resolvedTitle,
      showBackButton: true,
      onBackClick: () => router.push('/llm'),
    });

    return () => resetOptions();
  }, [resetOptions, resolvedTitle, router, setOptions]);

  return <LlmChatPage roomId={roomId} numericRoomId={numericRoomId} initialModel={model} />;
}
