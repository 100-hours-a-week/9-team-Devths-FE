'use client';

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
    <section className="bg-muted w-full max-w-sm rounded-2xl p-6 text-center">
      <div
        role="region"
        aria-label="서비스 소개 캐러셀"
        className="touch-pan-y select-none"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        <h2 className="text-base font-semibold">{slide.title}</h2>
        <p className="text-muted-foreground mt-2 text-sm">{slide.description}</p>
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
                isActive ? 'bg-foreground' : 'bg-foreground/30',
              ].join(' ')}
            />
          );
        })}
      </div>
    </section>
  );
}
