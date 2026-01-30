'use client';

import type { InterviewStage } from '@/types/calendar';

type CalendarFiltersProps = {
  stage: InterviewStage | '';
  tag: string;
  onStageChange: (stage: InterviewStage | '') => void;
  onTagChange: (tag: string) => void;
  onCreate: () => void;
};

export default function CalendarFilters({
  stage,
  tag,
  onStageChange,
  onTagChange,
  onCreate,
}: CalendarFiltersProps) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span>전형 단계</span>
          <select
            className="border-input bg-background h-9 rounded-md border px-3 text-sm"
            value={stage}
            onChange={(event) => onStageChange(event.target.value as InterviewStage | '')}
          >
            <option value="">전체</option>
            <option value="DOCUMENT">서류</option>
            <option value="CODING_TEST">코딩 테스트</option>
            <option value="INTERVIEW">면접</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>태그</span>
          <input
            className="border-input bg-background h-9 rounded-md border px-3 text-sm"
            type="text"
            placeholder="태그 입력"
            value={tag}
            onChange={(event) => onTagChange(event.target.value)}
          />
        </label>
      </div>
      <button
        type="button"
        className="bg-primary text-primary-foreground h-9 rounded-md px-4 text-sm"
        onClick={onCreate}
      >
        + 일정 추가
      </button>
    </div>
  );
}
