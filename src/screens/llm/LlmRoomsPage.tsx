'use client';

import { useMemo, useState } from 'react';

import LlmRoomCreateCard from '@/components/llm/rooms/LlmRoomCreateCard';
import LlmRoomEmptyState from '@/components/llm/rooms/LlmRoomEmptyState';
import LlmRoomList, { type LlmRoomData } from '@/components/llm/rooms/LlmRoomList';
import { mockRooms } from '@/screens/llm/_mockRooms';

import type { StorageStatus } from '@/components/llm/rooms/LlmRoomCard';

export default function LlmRoomsPage() {
  const [rooms, setRooms] = useState<LlmRoomData[]>(mockRooms);

  const hasRooms = useMemo(() => rooms.length > 0, [rooms.length]);

  if (!hasRooms) {
    return <LlmRoomEmptyState href="/llm/analysis?roomId=demo-room" />;
  }

  return (
    <main className="px-2 pt-4 pb-2">
      <LlmRoomCreateCard href="/llm/analysis?roomId=demo-room" />

      <LlmRoomList
        rooms={rooms}
        onToggleStatus={(id: string, next: StorageStatus) => {
          setRooms((prev) => prev.map((r) => (r.id === id ? { ...r, status: next } : r)));
        }}
        onDelete={(id: string) => {
          const ok = confirm('이 대화를 삭제할까요? (되돌릴 수 없어요)');
          if (!ok) return;
          setRooms((prev) => prev.filter((r) => r.id !== id));
        }}
      />
    </main>
  );
}
