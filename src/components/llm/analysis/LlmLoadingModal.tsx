'use client';

import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

const AUTO_CLOSE_SECONDS = 5;

type Props = {
  title?: string;
  description?: string;
  onClose?: () => void;
};

export default function LlmLoadingModal({
  title = '분석 중이에요 🔎',
  description = '종합 분석을 진행하고 있어요. 완료 시 알림으로 안내드릴게요.',
  onClose,
}: Props) {
  const [remainingSeconds, setRemainingSeconds] = useState(AUTO_CLOSE_SECONDS);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setRemainingSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    const timeoutId = window.setTimeout(() => {
      onClose?.();
    }, AUTO_CLOSE_SECONDS * 1000);

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(timeoutId);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[200]">
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute top-1/2 left-1/2 w-[calc(100%-32px)] -translate-x-1/2 -translate-y-1/2 sm:max-w-[430px]">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xl">
          <div>
            <p className="text-sm font-semibold text-neutral-900">{title}</p>
            <p className="mt-1 text-xs text-neutral-600">{description}</p>
            <p className="mt-1 text-xs text-neutral-600">다른 작업을 하셔도 괜찮아요!</p>
          </div>

          <div className="mt-5 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-neutral-700" />
          </div>
          <p className="mt-3 text-center text-[11px] text-neutral-500">
            자동으로 닫히기까지 {remainingSeconds}초
          </p>
        </div>
      </div>
    </div>
  );
}
