'use client';

import clsx from 'clsx';

import { toast } from '@/lib/toast/store';

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
          onClick={() => toast('vLLM은 다음 버전에 출시 예정입니다.')}
          className={clsx(
            'relative rounded-2xl px-3 py-2 text-sm font-semibold text-neutral-400',
            'bg-neutral-100',
          )}
        >
          vLLM
          <span className="absolute -top-2 right-2 rounded-full bg-neutral-900 px-2 py-0.5 text-[9px] font-semibold text-white">
            예정
          </span>
        </button>
      </div>
    </section>
  );
}
