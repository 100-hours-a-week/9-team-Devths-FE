'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { AppFrameContext, type AppFrameOptions } from '@/components/layout/AppFrameContext';
import BottomNav from '@/components/layout/BottomNav';
import Header from '@/components/layout/Header';
import { HeaderContext, type HeaderOptions } from '@/components/layout/HeaderContext';
import { NavigationGuardContext } from '@/components/layout/NavigationGuardContext';
import LlmAnalysisTaskWatcher from '@/components/llm/analysis/LlmAnalysisTaskWatcher';
import { getAccessToken } from '@/lib/auth/token';
import { toast } from '@/lib/toast/store';

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
  const router = useRouter();
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
  const isBottomNavVisible = true;
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null);
  const [isNavigationBlocked, setIsNavigationBlocked] = useState(false);
  const [blockMessage, setBlockMessage] = useState('답변 생성 중에는 이동할 수 없습니다.');

  useEffect(() => {
    setOptions(defaultOptions);
  }, [defaultOptions]);
  useEffect(() => {
    setFrameOptions(defaultFrameOptions);
  }, [defaultFrameOptions]);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setIsAuthed(false);
      router.replace('/');
      return;
    }

    setIsAuthed(true);
  }, [router]);

  const resetOptions = useCallback(() => {
    setOptions(defaultOptions);
  }, [defaultOptions]);
  const resetFrameOptions = useCallback(() => {
    setFrameOptions(defaultFrameOptions);
  }, [defaultFrameOptions]);

  useEffect(() => {
    if (!isNavigationBlocked) return;

    const handlePopState = () => {
      if (!isNavigationBlocked) return;
      window.history.pushState(null, '', window.location.href);
      toast(blockMessage);
    };

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isNavigationBlocked) return;
      event.preventDefault();
      event.returnValue = '';
    };

    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [blockMessage, isNavigationBlocked]);

  const requestNavigation = useCallback(
    (action: () => void) => {
      if (!isNavigationBlocked) {
        action();
        return;
      }
      toast(blockMessage);
    },
    [blockMessage, isNavigationBlocked],
  );

  return isAuthed ? (
    <AppFrameContext.Provider
      value={{
        options: frameOptions,
        setOptions: setFrameOptions,
        resetOptions: resetFrameOptions,
        defaultOptions: defaultFrameOptions,
      }}
    >
      <NavigationGuardContext.Provider
        value={{
          isBlocked: isNavigationBlocked,
          setBlocked: setIsNavigationBlocked,
          blockMessage,
          setBlockMessage,
          requestNavigation,
        }}
      >
        <HeaderContext.Provider value={{ options, setOptions, resetOptions, defaultOptions }}>
          <div
            className="min-h-dvh w-full bg-transparent"
            style={
              {
                '--bottom-nav-h': frameOptions.showBottomNav ? '64px' : '0px',
              } as CSSProperties
            }
          >
            <LlmAnalysisTaskWatcher />
            <div className="mx-auto min-h-dvh w-full bg-white sm:max-w-[430px] sm:shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
              <Header
                title={options.title}
                showBackButton={options.showBackButton}
                onBackClick={options.onBackClick}
                rightSlot={options.rightSlot}
              />
              <div className="px-4 pb-[var(--bottom-nav-h)] sm:px-6">{children}</div>
            </div>

            {frameOptions.showBottomNav ? <BottomNav hidden={!isBottomNavVisible} /> : null}
          </div>
        </HeaderContext.Provider>
      </NavigationGuardContext.Provider>
    </AppFrameContext.Provider>
  ) : null;
}
