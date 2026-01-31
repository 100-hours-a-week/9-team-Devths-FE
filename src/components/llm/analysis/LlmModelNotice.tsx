'use client';

import type { LlmModel } from '@/types/llm';

type Props = {
  model: LlmModel;
};

export default function LlmModelNotice({ model }: Props) {
  const isGemini = model === 'GEMINI';

  return (
    <section className="rounded-2xl border border-[#05C075]/20 bg-[#05C075]/5 p-4">
      <p className="text-[14px] font-bold text-[#05C075]">{isGemini ? 'Gemini' : 'vLLM'} 모델</p>

      <div className="mt-2 space-y-1 text-[13px] leading-5 text-[#4E5968]">
        {isGemini ? (
          <>
            <p>• 고성능 모델 기반으로 더 정교한 분석 결과를 기대할 수 있어요</p>
          </>
        ) : (
          <>
            <p>• 비용 효율적이고 보안 측면에서 유리한 구성을 목표로 해요</p>
            <p>• Gemini 대비 답변 품질이 다소 낮을 수 있어요</p>
          </>
        )}
      </div>
    </section>
  );
}
