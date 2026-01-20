'use client';

import { useState } from 'react';

import { LANDING_SLIDES } from '@/constants/landing';

export default function LandingCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const slide = LANDING_SLIDES[currentIndex];

  return (
    <section className="bg-muted w-full max-w-sm rounded-2xl p-6 text-center">
      <h2 className="text-base font-semibold">{slide.title}</h2>
      <p className="text-muted-foreground mt-2 text-sm">{slide.description}</p>

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
