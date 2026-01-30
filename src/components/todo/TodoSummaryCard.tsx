import type { ReactNode } from 'react';

type TodoSummaryCardProps = {
  title?: string;
  completionLabel?: string;
  children?: ReactNode;
};

export default function TodoSummaryCard({
  title = '오늘 할 일',
  completionLabel = '33% 완료',
  children,
}: TodoSummaryCardProps) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white px-4 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-neutral-900">{title}</h3>
          <button
            type="button"
            className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-neutral-200 text-sm text-neutral-500"
            aria-label="할 일 추가"
          >
            +
          </button>
        </div>
        <span className="text-xs font-medium text-neutral-500">{completionLabel}</span>
      </div>

      <div className="mt-3 h-2 w-full rounded-full bg-neutral-100">
        <div className="h-full w-1/3 rounded-full bg-neutral-300" />
      </div>

      <div className="mt-4 min-h-[96px] rounded-xl border border-dashed border-neutral-200 px-3 py-4 text-xs text-neutral-400">
        {children ?? '리스트 영역'}
      </div>
    </section>
  );
}
