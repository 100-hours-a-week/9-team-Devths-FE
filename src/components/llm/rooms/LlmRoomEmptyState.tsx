'use client';

import { MessageSquarePlus } from 'lucide-react';
import Link from 'next/link';

type Props = {
  href: string;
};

export default function LlmRoomEmptyState({ href }: Props) {
  return (
    <section className="flex min-h-[calc(100dvh-56px-64px)] flex-col items-center justify-center px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100">
        <MessageSquarePlus className="h-10 w-10 text-neutral-700" />
      </div>

      <h2 className="mt-6 text-lg font-semibold text-neutral-900">
        아직 저장된 대화 내역이 없어요.
      </h2>
      <p className="mt-2 text-sm leading-6 text-neutral-500">
        새 대화를 시작하고 이력서와 채용 공고를 분석해보세요.
      </p>

      <Link
        href={href}
        className="mt-8 inline-flex h-12 w-full max-w-[320px] items-center justify-center rounded-full bg-neutral-900 text-sm font-semibold text-white hover:bg-neutral-800"
      >
        새 대화 시작
      </Link>
    </section>
  );
}
