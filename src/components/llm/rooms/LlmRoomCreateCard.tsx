'use client';

import { Plus } from 'lucide-react';
import Link from 'next/link';

type Props = {
  href: string;
  disabled?: boolean;
  onDisabledClick?: () => void;
};

export default function LlmRoomCreateCard({ href, disabled, onDisabledClick }: Props) {
  return (
    <Link
      href={href}
      onClick={(event) => {
        if (!disabled) return;
        event.preventDefault();
        event.stopPropagation();
        onDisabledClick?.();
      }}
      aria-disabled={disabled}
      className={[
        'flex items-center justify-between rounded-2xl border bg-white px-4 py-4 shadow-sm transition',
        disabled
          ? 'cursor-not-allowed border-neutral-200 bg-neutral-50 text-neutral-400 opacity-70'
          : 'hover:border-neutral-300 hover:bg-neutral-50 active:bg-neutral-100',
      ].join(' ')}
    >
      <div
        className={[
          'text-sm font-semibold',
          disabled ? 'text-neutral-400' : 'text-neutral-900',
        ].join(' ')}
      >
        새 대화 시작
      </div>

      <div
        className={[
          'inline-flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white',
          disabled ? 'bg-neutral-100' : 'bg-white',
        ].join(' ')}
      >
        <Plus className={disabled ? 'h-5 w-5 text-neutral-400' : 'h-5 w-5 text-neutral-900'} />
      </div>
    </Link>
  );
}
