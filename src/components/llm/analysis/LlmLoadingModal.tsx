'use client';

import { Loader2, X } from 'lucide-react';

type Props = {
  open: boolean;
  title?: string;
  description?: string;
  onClose?: () => void;
};

export default function LlmLoadingModal({
  open,
  title = '분석 중이에요',
  description = '이력서와 채용 공고를 종합 분석하고 있어요.',
  onClose,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200]">
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute left-1/2 top-1/2 w-[calc(100%-32px)] -translate-x-1/2 -translate-y-1/2 sm:max-w-[430px]">
        <div className="rounded-2xl bg-white p-5 shadow-2xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-neutral-900">{title}</p>
              <p className="mt-1 text-xs text-neutral-600">{description}</p>
            </div>

            {onClose ? (
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-neutral-100"
                aria-label="닫기"
              >
                <X className="h-5 w-5" />
              </button>
            ) : null}
          </div>

          <div className="mt-5 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-neutral-700" />
          </div>
        </div>
      </div>
    </div>
  );
}
