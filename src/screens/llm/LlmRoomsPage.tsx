'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

import LlmRoomCreateCard from '@/components/llm/rooms/LlmRoomCreateCard';
import LlmRoomEmptyState from '@/components/llm/rooms/LlmRoomEmptyState';
import LlmRoomList from '@/components/llm/rooms/LlmRoomList';
import { useRoomsInfiniteQuery } from '@/lib/hooks/llm/useRoomsInfiniteQuery';
import { mapAiChatRoomToLlmRoom } from '@/lib/utils/llm';

export default function LlmRoomsPage() {
  const router = useRouter();
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useRoomsInfiniteQuery();

  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isLoading) {
    return (
      <main className="px-3 pt-4 pb-3">
        <div className="flex h-[60vh] items-center justify-center">
          <p className="text-sm text-neutral-500">로딩 중...</p>
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="px-3 pt-4 pb-3">
        <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
          <p className="text-sm font-semibold text-neutral-900">데이터를 불러올 수 없습니다</p>
          <p className="text-xs text-neutral-500">네트워크 연결을 확인해주세요</p>
        </div>
      </main>
    );
  }

  const rooms =
    data?.pages.flatMap((page) => (page ? page.rooms.map(mapAiChatRoomToLlmRoom) : [])) ?? [];
  const hasRooms = rooms.length > 0;

  if (!hasRooms) {
    return <LlmRoomEmptyState href="/llm/analysis?roomId=demo-room" />;
  }

  return (
    <main className="px-3 pt-4 pb-3">
      <LlmRoomCreateCard href="/llm/analysis?roomId=demo-room" />

      <div className="mt-4">
        <div className="mb-3 flex items-center justify-between px-1">
          <p className="text-sm font-semibold text-neutral-900">대화 목록</p>
          <span className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-[11px] font-semibold text-neutral-600">
            최신순
          </span>
        </div>
        <LlmRoomList
          rooms={rooms}
          onEnterRoom={(id) => router.push(`/llm/chat?roomId=${encodeURIComponent(id)}`)}
          onArchiveRoom={() => {}}
          onDeleteRoom={() => {}}
        />

        <div ref={loadMoreRef} className="mt-4 text-center">
          {isFetchingNextPage ? (
            <div className="rounded-2xl border border-dashed border-neutral-200 bg-white px-3 py-3 text-[11px] text-neutral-500">
              로딩 중...
            </div>
          ) : hasNextPage ? (
            <div className="rounded-2xl border border-dashed border-neutral-200 bg-white px-3 py-3 text-[11px] text-neutral-500">
              스크롤로 더 보기
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-neutral-200 bg-white px-3 py-3 text-[11px] text-neutral-500">
              모든 대화를 불러왔습니다
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
