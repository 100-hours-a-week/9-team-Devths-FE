'use client';

import { Trash2 } from 'lucide-react';

import type { LlmRoom } from '@/components/llm/rooms/types';

type Props = {
  room: LlmRoom;
  isAnalyzing?: boolean;
  onEnter?: () => void;
  onAnalyzingClick?: () => void;
  onDelete?: (roomId: string) => void;
};

export default function LlmRoomListItem({
  room,
  isAnalyzing,
  onEnter,
  onAnalyzingClick,
  onDelete,
}: Props) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => {
            if (isAnalyzing) {
              onAnalyzingClick?.();
              return;
            }
            onEnter?.();
          }}
          className="flex min-w-0 flex-1 flex-col text-left"
        >
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate text-sm font-semibold text-neutral-900">{room.title}</span>
            {isAnalyzing ? (
              <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                분석 중
              </span>
            ) : null}
          </div>
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
