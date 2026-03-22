'use client';

import { Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const AUTO_CLOSE_SECONDS = 5;
const TITLE_ID = 'llm-loading-modal-title';

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
  const portalRootRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<Element | null>(null);

  // 자동 닫힘 타이머
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

  // 포커스 저장 → 다이얼로그로 이동, 닫힐 때 복원
  useEffect(() => {
    triggerRef.current = document.activeElement;

    const raf = requestAnimationFrame(() => {
      dialogRef.current?.focus();
    });

    return () => {
      cancelAnimationFrame(raf);
      if (triggerRef.current instanceof HTMLElement) {
        triggerRef.current.focus();
      }
      triggerRef.current = null;
    };
  }, []);

  // 접근성 모드: 배경 콘텐츠 inert 처리
  useEffect(() => {
    if (!document.documentElement.classList.contains('accessibility-mode')) return;

    const portalRoot = portalRootRef.current;
    if (!portalRoot) return;

    const siblings = Array.from(document.body.children).filter(
      (el): el is HTMLElement => el instanceof HTMLElement && el !== portalRoot,
    );
    const previousStates = siblings.map((el) => ({
      el,
      ariaHidden: el.getAttribute('aria-hidden'),
      inert: el.inert,
    }));

    siblings.forEach((el) => {
      el.setAttribute('aria-hidden', 'true');
      el.inert = true;
    });

    return () => {
      previousStates.forEach(({ el, ariaHidden, inert }) => {
        if (ariaHidden === null) {
          el.removeAttribute('aria-hidden');
        } else {
          el.setAttribute('aria-hidden', ariaHidden);
        }
        el.inert = inert;
      });
    };
  }, []);

  return createPortal(
    <div ref={portalRootRef} className="fixed inset-0 z-[200]">
      <div aria-hidden="true" className="absolute inset-0 bg-black/45" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={TITLE_ID}
        tabIndex={-1}
        className="absolute top-1/2 left-1/2 w-[calc(100%-32px)] -translate-x-1/2 -translate-y-1/2 outline-none sm:max-w-[430px]"
      >
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xl">
          <div className="flex items-center gap-2 text-[11px] font-semibold text-neutral-500">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#05C075]" />
            AI ANALYSIS
          </div>
          <div className="mt-2">
            <p id={TITLE_ID} className="text-base font-semibold text-neutral-900">
              {title}
            </p>
            <p className="mt-1 text-xs leading-5 text-neutral-600">{description}</p>
            <p className="mt-1 text-xs text-neutral-600">다른 작업을 하셔도 괜찮아요!</p>
          </div>

          <div className="mt-5 flex items-center justify-center gap-2">
            <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin text-[#05C075]" />
            <span className="text-xs font-semibold text-neutral-700">분석 중</span>
          </div>
          <div
            aria-live="polite"
            aria-atomic="true"
            className="mt-3 flex items-center justify-center gap-2 text-[11px] font-semibold text-neutral-500"
          >
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#05C075]" />
            자동으로 닫히기까지 {remainingSeconds}초
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
