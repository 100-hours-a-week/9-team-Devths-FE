'use client';

import { useState } from 'react';

import type { InterviewStage } from '@/types/calendar';

type CalendarFiltersProps = {
  stage: InterviewStage | '';
  tag: string;
  onStageChange: (stage: InterviewStage | '') => void;
  onTagChange: (tag: string) => void;
  onReset: () => void;
};

const stages: Array<{ value: InterviewStage; label: string }> = [
  { value: 'DOCUMENT', label: '서류' },
  { value: 'CODING_TEST', label: '코딩 테스트' },
  { value: 'INTERVIEW', label: '면접' },
];

export default function CalendarFilters({
  stage,
  tag,
  onStageChange,
  onTagChange,
  onReset,
}: CalendarFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const activeFilterCount = (stage ? 1 : 0) + (tag.trim() ? 1 : 0);

  return (
    <div className="-mx-4 border-t border-[#E8E8E8] bg-white">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between px-4 py-3"
      >
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-[#151515]">필터</h3>
          {activeFilterCount > 0 ? (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#05C075] text-xs font-bold text-white">
              {activeFilterCount}
            </span>
          ) : null}
        </div>
        <svg
          className={`h-5 w-5 text-[#151515] transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen ? (
        <div className="border-t border-[#E8E8E8] px-4 pb-4">
          <div className="flex items-center justify-end pt-4">
            <button
              type="button"
              onClick={onReset}
              className="text-xs font-medium text-[#8A8A8A] hover:text-[#151515]"
            >
              초기화
            </button>
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-xs font-medium text-[#8A8A8A]">단계</label>
            <div className="flex flex-wrap gap-2">
              {stages.map((stageOption) => (
                <button
                  key={stageOption.value}
                  type="button"
                  onClick={() =>
                    onStageChange(stage === stageOption.value ? '' : stageOption.value)
                  }
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                    stage === stageOption.value
                      ? 'border-[#05C075] bg-[#05C075] text-white'
                      : 'border-[#E8E8E8] bg-white text-[#151515] hover:border-[#05C075]'
                  }`}
                >
                  {stageOption.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-[#8A8A8A]">태그</label>
            <input
              className="w-full rounded-lg border border-[#E8E8E8] bg-white px-3 py-2 text-sm text-[#151515] placeholder:text-[#CCCCCC] focus:border-[#05C075] focus:outline-none"
              type="text"
              placeholder="태그 입력..."
              value={tag}
              onChange={(event) => onTagChange(event.target.value)}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
