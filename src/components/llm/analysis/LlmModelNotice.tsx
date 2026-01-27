'use client';

import type { LlmModel } from '@/types/llm';

type Props = {
  model: LlmModel;
};

export default function LlmModelNotice({ model }: Props) {
  const isGemini = model === 'GEMINI';

  return (
    <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-neutral-900">
        현재 선택: {isGemini ? 'Gemini' : 'vLLM'}
      </p>

      <div className="mt-2 text-xs leading-5 text-neutral-600">
        {isGemini ? (
          <>
            <p>• 고성능 모델 기반으로 더 정교한 분석 결과를 기대할 수 있어요.</p>
            <p>• 비용이 상대적으로 높을 수 있어요.</p>
          </>
        ) : (
          <>
            <p>• 비용 효율적이고 보안 측면에서 유리한 구성을 목표로 해요.</p>
            <p>• Gemini 대비 답변 품질이 다소 낮을 수 있어요.</p>
          </>
        )}
      </div>
    </section>
  );
}
