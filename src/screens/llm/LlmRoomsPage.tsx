'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import LlmRoomCreateCard from '@/components/llm/rooms/LlmRoomCreateCard';
import LlmRoomEmptyState from '@/components/llm/rooms/LlmRoomEmptyState';
import LlmRoomList from '@/components/llm/rooms/LlmRoomList';
import { mockRooms } from '@/screens/llm/_mockRooms';

import type { LlmRoom } from '@/components/llm/rooms/types';

export default function LlmRoomsPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<LlmRoom[]>(mockRooms);

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
          onArchiveRoom={(id) => {
            setRooms((prev) => prev.map((r) => (r.id === id ? { ...r, storage: 'ARCHIVED' } : r)));
          }}
          onDeleteRoom={(id) => {
            setRooms((prev) => prev.filter((r) => r.id !== id));
          }}
        />

        <div className="mt-4 rounded-2xl border border-dashed border-neutral-200 bg-white px-3 py-3 text-center text-[11px] text-neutral-500">
          스크롤로 더 보기
        </div>
      </div>
    </main>
  );
}
