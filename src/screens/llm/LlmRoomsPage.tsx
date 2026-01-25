'use client';

import LlmRoomEmptyState from '@/components/llm/rooms/LlmRoomEmptyState';

export default function LlmRoomsPage() {
  const rooms: Array<{ id: string; title: string }> = [];

  if (rooms.length === 0) {
    return <LlmRoomEmptyState href="/llm/analysis?roomId=demo-room" />;
  }

  return (
    <main>
      <div className="p-4">rooms list</div>
    </main>
  );
}
