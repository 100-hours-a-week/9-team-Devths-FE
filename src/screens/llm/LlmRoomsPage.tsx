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
        <LlmRoomList
          rooms={rooms}
          onEnterRoom={(id) => router.push(`/llm/chat?roomId=${encodeURIComponent(id)}`)}
        onArchiveRoom={(id) => {
          setRooms((prev) =>
            prev.map((r) => (r.id === id ? { ...r, storage: 'ARCHIVED' } : r)),
          );
        }}
        onDeleteRoom={(id) => {
          setRooms((prev) => prev.filter((r) => r.id !== id));
        }}
      />
      </div>
    </main>
  );
}
