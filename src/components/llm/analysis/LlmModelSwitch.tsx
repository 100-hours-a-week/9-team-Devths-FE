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
    <section className="py-5">
      <h2 className="text-[15px] font-bold text-[#191F28]">모델 선택</h2>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onChange('GEMINI')}
          className={clsx(
            'rounded-xl px-4 py-3 text-[15px] font-semibold transition-colors',
            value === 'GEMINI'
              ? 'bg-[#05C075] text-white'
              : 'bg-neutral-100 text-[#8B95A1] active:bg-neutral-200',
          )}
        >
          Gemini
        </button>

        <button
          type="button"
          onClick={() => toast('vLLM은 다음 버전에 출시 예정입니다.')}
          className="relative rounded-xl bg-neutral-100 px-4 py-3 text-[15px] font-semibold text-[#ADB5BD]"
        >
          vLLM
          <span className="absolute -top-1.5 -right-1 rounded-lg bg-[#191F28] px-2 py-0.5 text-[10px] font-bold text-white">
            예정
          </span>
        </button>
      </div>
    </section>
  );
}
