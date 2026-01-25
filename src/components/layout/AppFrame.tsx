'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { AppFrameContext, type AppFrameOptions } from '@/components/layout/AppFrameContext';
import BottomNav from '@/components/layout/BottomNav';
import Header from '@/components/layout/Header';
import { HeaderContext, type HeaderOptions } from '@/components/layout/HeaderContext';

import type { CSSProperties, ReactNode } from 'react';

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
  const defaultFrameOptions = useMemo<AppFrameOptions>(() => ({ showBottomNav: true }), []);
  const [frameOptions, setFrameOptions] = useState<AppFrameOptions>(defaultFrameOptions);

  useEffect(() => {
    setOptions(defaultOptions);
  }, [defaultOptions]);
  useEffect(() => {
    setFrameOptions(defaultFrameOptions);
  }, [defaultFrameOptions]);

  const resetOptions = useCallback(() => {
    setOptions(defaultOptions);
  }, [defaultOptions]);
  const resetFrameOptions = useCallback(() => {
    setFrameOptions(defaultFrameOptions);
  }, [defaultFrameOptions]);

  return (
    <AppFrameContext.Provider
      value={{
        options: frameOptions,
        setOptions: setFrameOptions,
        resetOptions: resetFrameOptions,
        defaultOptions: defaultFrameOptions,
      }}
    >
      <HeaderContext.Provider value={{ options, setOptions, resetOptions, defaultOptions }}>
        <div
          className="min-h-dvh w-full bg-neutral-50"
          style={
            {
              '--bottom-nav-h': frameOptions.showBottomNav ? '64px' : '0px',
            } as CSSProperties
          }
        >
          <div className="mx-auto min-h-dvh w-full bg-white sm:max-w-[430px]">
            <Header
              title={options.title}
              showBackButton={options.showBackButton}
              onBackClick={options.onBackClick}
              rightSlot={options.rightSlot}
            />
            <div className="px-4 pb-[var(--bottom-nav-h)] sm:px-6">{children}</div>
          </div>

          {frameOptions.showBottomNav ? <BottomNav /> : null}
        </div>
      </HeaderContext.Provider>
    </AppFrameContext.Provider>
  );
}
