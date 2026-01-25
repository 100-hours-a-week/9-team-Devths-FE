'use client';

import Link from 'next/link';

export default function LlmRoomsPage() {
  return (
    <main className="p-4">
      <h1 className="text-lg font-semibold">LLM-001 대화 목록</h1>
      <p className="text-muted-foreground mt-2 text-sm">라우팅/화면 스켈레톤만 연결합니다.</p>

      <div className="mt-6 flex flex-col gap-2">
        <Link className="underline" href="/llm/chat?roomId=demo-room">
          채팅으로 이동 (LLM-003)
        </Link>
        <Link className="underline" href="/llm/analysis?roomId=demo-room">
          분석 입력으로 이동 (LLM-002)
        </Link>
      </div>
    </main>
  );
}
