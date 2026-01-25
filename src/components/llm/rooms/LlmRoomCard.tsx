'use client';

import clsx from 'clsx';
import { Trash2 } from 'lucide-react';
import Link from 'next/link';

export type StorageStatus = 'TEMP' | 'SAVED';

type Props = {
  id: string;
  title: string;
  status: StorageStatus;
  onToggleStatus?: (next: StorageStatus) => void;
  onDelete?: () => void;
};

export default function LlmRoomCard({ id, title, status, onToggleStatus, onDelete }: Props) {
  const isSaved = status === 'SAVED';

  return (
    <div className="flex items-center justify-between rounded-2xl border bg-white px-4 py-5">
      <Link href={`/llm/chat?roomId=${encodeURIComponent(id)}`} className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-neutral-900">{title}</p>
      </Link>

      <div className="ml-3 flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={() => {
            if (isSaved) return;
            onToggleStatus?.('SAVED');
          }}
          disabled={isSaved}
          className={clsx(
            'h-9 rounded-full px-3 text-[11px] font-semibold',
            isSaved
              ? 'cursor-not-allowed bg-neutral-100 text-neutral-400'
              : 'bg-neutral-900 text-white hover:bg-neutral-800 active:bg-neutral-900',
          )}
          aria-label="보관 상태 변경"
        >
          {isSaved ? '보관됨' : '보관'}
        </button>

        <button
          type="button"
          onClick={onDelete}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-neutral-100 active:bg-neutral-200"
          aria-label="대화 삭제"
        >
          <Trash2 className="h-5 w-5 text-neutral-900" />
        </button>
      </div>
    </div>
  );
}
