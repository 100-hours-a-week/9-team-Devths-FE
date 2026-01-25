'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import BottomNav from '@/components/layout/BottomNav';
import Header from '@/components/layout/Header';
import { HeaderContext, type HeaderOptions } from '@/components/layout/HeaderContext';

import type { ReactNode } from 'react';

type AppFrameProps = {
  children: ReactNode;
  headerTitle?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  rightSlot?: ReactNode;
};

export default function AppFrame({
  children,
  headerTitle = 'Devths',
  showBackButton = false,
  onBackClick,
  rightSlot,
}: AppFrameProps) {
  const defaultOptions = useMemo<HeaderOptions>(
    () => ({
      title: headerTitle,
      showBackButton,
      onBackClick,
      rightSlot,
    }),
    [headerTitle, onBackClick, rightSlot, showBackButton],
  );

  const [options, setOptions] = useState<HeaderOptions>(defaultOptions);

  useEffect(() => {
    setOptions(defaultOptions);
  }, [defaultOptions]);

  const resetOptions = useCallback(() => {
    setOptions(defaultOptions);
  }, [defaultOptions]);

  return (
    <HeaderContext.Provider value={{ options, setOptions, resetOptions, defaultOptions }}>
      <div className="min-h-dvh w-full bg-neutral-50">
        <div className="mx-auto min-h-dvh w-full bg-white sm:max-w-[430px]">
          <Header
            title={options.title}
            showBackButton={options.showBackButton}
            onBackClick={options.onBackClick}
            rightSlot={options.rightSlot}
          />
          <div className="px-4 pb-16 sm:px-6">{children}</div>
        </div>

        <BottomNav />
      </div>
    </HeaderContext.Provider>
  );
}
