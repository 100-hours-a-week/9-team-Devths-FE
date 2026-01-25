'use client';

import clsx from 'clsx';
import Link from 'next/link';

type Props = {
  id: string;
  title: string;
  preview?: string;
  updatedAtLabel?: string;
  href: string;
};

export default function LlmRoomListItem({ title, preview, updatedAtLabel, href }: Props) {
  return (
    <Link
      href={href}
      className={clsx(
        'flex items-center gap-3 px-3 py-3',
        'hover:bg-neutral-50 active:bg-neutral-100',
      )}
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-neutral-200">
        <span className="text-sm font-semibold text-neutral-700">{title.slice(0, 1)}</span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-semibold text-neutral-900">{title}</p>
          {updatedAtLabel ? (
            <span className="shrink-0 text-[11px] text-neutral-400">{updatedAtLabel}</span>
          ) : null}
        </div>

        <p className="mt-1 truncate text-[12px] leading-5 text-neutral-500">
          {preview ?? '대화를 이어서 진행해보세요.'}
        </p>
      </div>
    </Link>
  );
}
