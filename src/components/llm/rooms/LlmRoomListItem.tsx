'use client';

import { Trash2 } from 'lucide-react';

import type { LlmRoom } from '@/components/llm/rooms/types';

type Props = {
  room: LlmRoom;
  onEnter?: (roomId: string) => void;
  onDelete?: (roomId: string) => void;
};

export default function LlmRoomListItem({ room, onEnter, onDelete }: Props) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onEnter?.(room.id)}
          className="flex min-w-0 flex-1 flex-col text-left"
        >
          <span className="truncate text-sm font-semibold text-neutral-900">{room.title}</span>
          <span className="mt-1 text-[11px] text-neutral-500">{room.updatedAt}</span>
        </button>

        <button
          type="button"
          onClick={() => onDelete?.(room.id)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border bg-white hover:bg-neutral-50"
          aria-label="대화 삭제"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
