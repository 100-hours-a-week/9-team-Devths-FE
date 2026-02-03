'use client';

import { MessageSquarePlus } from 'lucide-react';
import Link from 'next/link';

type Props = {
  href: string;
};

export default function LlmRoomEmptyState({ href }: Props) {
  return (
    <section className="flex min-h-[calc(100dvh-56px-64px)] flex-col items-center justify-center px-5 text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-[#00C473]/10">
        <MessageSquarePlus className="h-12 w-12 text-[#00C473]" strokeWidth={1.5} />
      </div>

      <h2 className="mt-8 text-[22px] font-bold tracking-tight text-[#191F28]">
        아직 저장된 대화가 없어요
      </h2>
      <p className="mt-3 text-[15px] leading-relaxed text-[#8B95A1]">
        새 대화를 시작하고
        <br />
        이력서와 채용 공고를 분석해보세요
      </p>

      <Link
        href={href}
        className="mt-10 inline-flex h-14 w-full max-w-[280px] items-center justify-center rounded-2xl bg-[#00C473] text-[17px] font-semibold text-white transition-colors active:bg-[#00A85F]"
      >
        새 대화 시작하기
      </Link>
    </section>
  );
}
