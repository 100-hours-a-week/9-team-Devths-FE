'use client';

import clsx from 'clsx';
import { Trash2 } from 'lucide-react';

import type { LlmRoom } from '@/components/llm/rooms/types';

type Props = {
  room: LlmRoom;
  onEnter?: (roomId: string) => void;
  onDelete?: (roomId: string) => void;
  onArchive?: (roomId: string) => void;
};

export default function LlmRoomListItem({ room, onEnter, onDelete, onArchive }: Props) {
  const isArchived = room.storage === 'ARCHIVED';

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

        <div className="flex items-center gap-2">
          <div className="flex overflow-hidden rounded-full border bg-neutral-50 p-0.5">
            <button
              type="button"
              disabled
              className={clsx(
                'px-3 py-1 text-[11px] font-medium',
                !isArchived
                  ? 'rounded-full bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-400',
              )}
              aria-disabled="true"
              title="보관 상태로 변경되면 임시로 되돌릴 수 없어요."
            >
              임시
            </button>

            <button
              type="button"
              onClick={() => {
                if (!isArchived) onArchive?.(room.id);
              }}
              disabled={isArchived}
              className={clsx(
                'px-3 py-1 text-[11px] font-medium',
                isArchived
                  ? 'rounded-full bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900',
                isArchived ? 'cursor-not-allowed opacity-70' : '',
              )}
              title={isArchived ? '이미 보관된 대화입니다.' : '보관하기'}
            >
              {isArchived ? '보관됨' : '보관'}
            </button>
          </div>

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
    </div>
  );
}
