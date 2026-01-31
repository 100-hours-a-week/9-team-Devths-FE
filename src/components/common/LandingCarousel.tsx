'use client';

import { Bot, Briefcase, CalendarDays, MessageSquare } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { LANDING_SLIDES } from '@/constants/landing';

const AUTO_PLAY_DELAY_MS = 5000;
const SWIPE_THRESHOLD_PX = 40;

export default function LandingCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const startXRef = useRef<number | null>(null);

  const intervalRef = useRef<number | null>(null);

  const lastIndex = LANDING_SLIDES.length - 1;
  const slide = LANDING_SLIDES[currentIndex];

  const goTo = (nextIndex: number) => {
    if (nextIndex < 0) return setCurrentIndex(lastIndex);
    if (nextIndex > lastIndex) return setCurrentIndex(0);
    setCurrentIndex(nextIndex);
  };

  const startAutoPlay = () => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
    }

    intervalRef.current = window.setInterval(() => {
      setCurrentIndex((prev) => (prev >= lastIndex ? 0 : prev + 1));
    }, AUTO_PLAY_DELAY_MS);
  };

  const resetAutoPlay = () => {
    startAutoPlay();
  };

  useEffect(() => {
    startAutoPlay();

    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastIndex]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    startXRef.current = e.clientX;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (startXRef.current === null) return;

    const diffX = e.clientX - startXRef.current;
    startXRef.current = null;

    if (Math.abs(diffX) < SWIPE_THRESHOLD_PX) return;

    resetAutoPlay();

    if (diffX < 0) goTo(currentIndex + 1);
    else goTo(currentIndex - 1);
  };

  const handlePointerCancel = () => {
    startXRef.current = null;
  };

  const handleDotClick = (idx: number) => {
    setCurrentIndex(idx);
    resetAutoPlay();
  };

  return (
    <section className="w-full rounded-3xl border border-black/5 bg-white p-6 text-center shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
      <div
        role="region"
        aria-label="서비스 소개 캐러셀"
        className="flex min-h-[150px] touch-pan-y flex-col items-center justify-center select-none"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        {slide.id === 'slide-1' ? (
          <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-[#05C075]/10 text-[#05C075]">
            <Briefcase className="h-4 w-4" />
          </div>
        ) : null}
        {slide.id === 'slide-2' ? (
          <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-[#05C075]/10 text-[#05C075]">
            <Bot className="h-4 w-4" />
          </div>
        ) : null}
        {slide.id === 'slide-3' ? (
          <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-[#05C075]/10 text-[#05C075]">
            <MessageSquare className="h-4 w-4" />
          </div>
        ) : null}
        {slide.id === 'slide-4' ? (
          <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-[#05C075]/10 text-[#05C075]">
            <CalendarDays className="h-4 w-4" />
          </div>
        ) : null}
        <h2 className="mt-2 text-lg font-semibold text-black">{slide.title}</h2>
        <p className="mt-2 text-sm whitespace-pre-line text-black/45">{slide.description}</p>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2">
        {LANDING_SLIDES.map((s, idx) => {
          const isActive = idx === currentIndex;

          return (
            <button
              key={s.id}
              type="button"
              onClick={() => handleDotClick(idx)}
              aria-label={`슬라이드 ${idx + 1}로 이동`}
              aria-current={isActive ? 'true' : undefined}
              className={[
                'h-2 w-2 rounded-full transition',
                isActive ? 'bg-[#05C075]' : 'bg-black/20',
              ].join(' ')}
            />
          );
        })}
      </div>
    </section>
  );
}
