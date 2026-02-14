'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { AppFrameContext, type AppFrameOptions } from '@/components/layout/AppFrameContext';
import BottomNav from '@/components/layout/BottomNav';
import Header from '@/components/layout/Header';
import { HeaderContext, type HeaderOptions } from '@/components/layout/HeaderContext';
import { NavigationGuardContext } from '@/components/layout/NavigationGuardContext';
import LlmAnalysisTaskWatcher from '@/components/llm/analysis/LlmAnalysisTaskWatcher';
import { ensureAccessToken } from '@/lib/api/client';
import { getAccessToken, setAuthRedirect } from '@/lib/auth/token';
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
  const pathname = usePathname();
  const searchParams = useSearchParams();
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
  const [blockedNavigationHandler, setBlockedNavigationHandler] = useState<
    ((action: () => void) => void) | null
  >(null);

  useEffect(() => {
    setOptions(defaultOptions);
  }, [defaultOptions]);
  useEffect(() => {
    setFrameOptions(defaultFrameOptions);
  }, [defaultFrameOptions]);

  useEffect(() => {
    let isCancelled = false;

    const checkAuth = async () => {
      const token = getAccessToken();
      if (token) {
        if (!isCancelled) {
          setIsAuthed(true);
        }
        return;
      }

      const restored = await ensureAccessToken();
      if (isCancelled) {
        return;
      }

      if (restored) {
        setIsAuthed(true);
        return;
      }

      const query = searchParams?.toString() ?? '';
      const redirectPath = `${pathname}${query ? `?${query}` : ''}`;
      setAuthRedirect(redirectPath);
      setIsAuthed(false);
      router.replace(`/?redirect=${encodeURIComponent(redirectPath)}`);
    };

    void checkAuth();

    return () => {
      isCancelled = true;
    };
  }, [pathname, router, searchParams]);

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
      if (blockedNavigationHandler) {
        blockedNavigationHandler(action);
        return;
      }
      toast(blockMessage);
    },
    [blockMessage, blockedNavigationHandler, isNavigationBlocked],
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
          setBlockedNavigationHandler,
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
