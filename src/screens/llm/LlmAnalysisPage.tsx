'use client';

type Props = {
  roomId: string;
};

export default function LlmAnalysisPage({ roomId }: Props) {
  return (
    <main className="p-4">
      <h1 className="text-lg font-semibold">LLM-002 입력/분석</h1>
      <p className="text-muted-foreground mt-2 text-sm">roomId: {roomId}</p>

      <section className="mt-6 rounded-lg border p-4">
        <p className="text-muted-foreground text-sm">
          입력 카드 2개(이력서/공고) + 첨부 토글 + 모델 토글 + 로딩 모달을 붙일 예정
        </p>
      </section>
    </main>
  );
}
