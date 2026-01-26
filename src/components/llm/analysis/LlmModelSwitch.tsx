'use client';

import clsx from 'clsx';

import type { LlmModel } from '@/types/llm';

type Props = {
  value: LlmModel;
  onChange: (v: LlmModel) => void;
};

export default function LlmModelSwitch({ value, onChange }: Props) {
  return (
    <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-neutral-900">모델 선택</h2>

      <div className="mt-3 grid grid-cols-2 gap-2 rounded-2xl bg-neutral-50 p-1">
        <button
          type="button"
          onClick={() => onChange('GEMINI')}
          className={clsx(
            'rounded-2xl px-3 py-2 text-sm font-semibold transition',
            value === 'GEMINI'
              ? 'bg-white text-neutral-900 shadow-sm'
              : 'text-neutral-600 hover:text-neutral-900',
          )}
        >
          Gemini
        </button>

        <button
          type="button"
          onClick={() => onChange('VLLM')}
          className={clsx(
            'rounded-2xl px-3 py-2 text-sm font-semibold transition',
            value === 'VLLM'
              ? 'bg-white text-neutral-900 shadow-sm'
              : 'text-neutral-600 hover:text-neutral-900',
          )}
        >
          vLLM
        </button>
      </div>

      <p className="mt-2 text-xs text-neutral-500">
        Gemini는 성능이 높지만 비용이 높을 수 있고, vLLM은 비용 및 보안 측면에서 유리합니다.
      </p>
    </section>
  );
}
