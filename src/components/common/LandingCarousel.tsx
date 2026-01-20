'use client';

import { useRef, useState } from 'react';

import { LANDING_SLIDES } from '@/constants/landing';

export default function LandingCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const startXRef = useRef<number | null>(null);

  const slide = LANDING_SLIDES[currentIndex];
  const lastIndex = LANDING_SLIDES.length - 1;

  const goTo = (nextIndex: number) => {
    if (nextIndex < 0) return setCurrentIndex(lastIndex);
    if (nextIndex > lastIndex) return setCurrentIndex(0);
    setCurrentIndex(nextIndex);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    startXRef.current = e.clientX;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (startXRef.current === null) return;

    const diffX = e.clientX - startXRef.current;
    startXRef.current = null;

    const SWIPE_THRESHOLD = 40;
    if (Math.abs(diffX) < SWIPE_THRESHOLD) return;

    if (diffX < 0) goTo(currentIndex + 1);
    else goTo(currentIndex - 1);
  };

  const handlePointerCancel = () => {
    startXRef.current = null;
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
              onClick={() => setCurrentIndex(idx)}
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
