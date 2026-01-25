'use client';

import { Plus } from 'lucide-react';
import Link from 'next/link';

type Props = {
  href: string;
};

export default function LlmRoomCreateCard({ href }: Props) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-2xl border bg-white px-4 py-5 hover:bg-neutral-50 active:bg-neutral-100"
    >
      <div className="text-sm font-semibold text-neutral-900">새 대화 시작</div>

      <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border">
        <Plus className="h-5 w-5 text-neutral-900" />
      </div>
    </Link>
  );
}
