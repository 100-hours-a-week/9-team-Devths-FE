'use client';

import { MessageCircle } from 'lucide-react';
import Link from 'next/link';

export default function LlmResultPage() {
  return (
    <main className="min-h-[calc(100dvh-56px-64px)] bg-white px-4 pt-6 pb-6 text-black">
      <section className="space-y-5">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-neutral-400 uppercase">
            Result
          </p>
          <h1 className="mt-2 text-2xl font-semibold">AI 답변 출력</h1>
          <p className="mt-2 text-sm text-neutral-600">
            입력한 이력서/공고를 기반으로 요약 결과를 제공합니다.
          </p>
        </div>

        <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-5">
          <p className="text-xs font-semibold text-neutral-500">요약 결과</p>
          <div className="mt-4 space-y-4 text-sm leading-6 text-neutral-800">
            <div className="flex gap-3">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-neutral-200 text-xs text-neutral-600">
                1
              </span>
              <p>
                <span className="font-semibold text-neutral-900">핵심 강점</span> · 실무 프로젝트
                경험이 풍부하며 협업 도구 활용 능력이 뛰어납니다.
              </p>
            </div>
            <div className="flex gap-3">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-neutral-200 text-xs text-neutral-600">
                2
              </span>
              <p>
                <span className="font-semibold text-neutral-900">보완 포인트</span> · 성과 지표를
                수치화해 기여도를 명확히 보여주세요.
              </p>
            </div>
            <div className="flex gap-3">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-neutral-200 text-xs text-neutral-600">
                3
              </span>
              <p>
                <span className="font-semibold text-neutral-900">추천 방향</span> · 지원 직무와
                맞닿은 기술 스택을 상단에 배치하세요.
              </p>
            </div>
          </div>
        </div>

        <Link
          href="/llm/chat?roomId=demo-room"
          className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-black px-4 py-4 text-sm font-semibold text-white hover:bg-neutral-900"
        >
          대화 시작하기
          <MessageCircle className="h-5 w-5" />
        </Link>
      </section>
    </main>
  );
}
