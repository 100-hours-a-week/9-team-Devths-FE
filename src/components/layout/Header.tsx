'use client';

import { Bell, ChevronLeft, PersonStanding } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { useNavigationGuard } from '@/components/layout/NavigationGuardContext';
import { useUnreadCountQuery } from '@/lib/hooks/notifications/useUnreadCountQuery';

import type { ReactNode } from 'react';

type HeaderProps = {
  title?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  rightSlot?: ReactNode;
  showAccessibilityButton?: boolean;
  accessibilityActive?: boolean;
  onAccessibilityClick?: () => void;
};

export default function Header({
  title = 'Devths',
  showBackButton = false,
  onBackClick,
  rightSlot,
  showAccessibilityButton = false,
  accessibilityActive = false,
  onAccessibilityClick,
}: HeaderProps) {
  const router = useRouter();
  const { data: unreadCount } = useUnreadCountQuery();
  const { requestNavigation } = useNavigationGuard();
  const showBadge = typeof unreadCount === 'number' && unreadCount > 0;
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const accessibilityTriggerRef = useRef<HTMLButtonElement | null>(null);
  const accessibilityActionRef = useRef<HTMLButtonElement | null>(null);
  const wasPopoverOpenRef = useRef(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  const handleBackClick = () => {
    if (!onBackClick) return;
    requestNavigation(() => onBackClick());
  };

  const handleHomeClick = () => {
    requestNavigation(() => router.push('/llm'));
  };

  const handleNotificationsClick = () => {
    requestNavigation(() => router.push('/notifications'));
  };

  const handleAccessibilityButtonClick = () => {
    setIsPopoverOpen((prev) => !prev);
  };

  const handleAccessibilityAction = () => {
    onAccessibilityClick?.();
    setIsPopoverOpen(false);
  };

  useEffect(() => {
    if (!isPopoverOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsPopoverOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setIsPopoverOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPopoverOpen]);

  useEffect(() => {
    if (isPopoverOpen) {
      wasPopoverOpenRef.current = true;
      requestAnimationFrame(() => {
        accessibilityActionRef.current?.focus();
      });
      return;
    }

    if (!wasPopoverOpenRef.current) {
      return;
    }

    wasPopoverOpenRef.current = false;
    requestAnimationFrame(() => {
      accessibilityTriggerRef.current?.focus();
    });
  }, [isPopoverOpen]);

  return (
    <header
      className="sticky top-0 z-50 w-full border-b bg-white"
      style={{ viewTransitionName: 'site-header' }}
    >
      <div className="flex h-14 items-center px-4 sm:px-6">
        <div className="flex items-center gap-2">
          {showBackButton ? (
            <button
              type="button"
              onClick={handleBackClick}
              className="inline-flex h-11 w-11 items-center justify-center rounded-md hover:bg-neutral-100"
              aria-label="이전 화면으로 이동"
            >
              <ChevronLeft aria-hidden="true" className="h-5 w-5" />
            </button>
          ) : null}
          {title === 'Devths' ? (
            <button
              type="button"
              onClick={handleHomeClick}
              className="inline-flex items-center rounded-md transition hover:opacity-80"
              aria-label="Devths 홈 이동"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/icons/Devths2.png"
                alt="Devths"
                width={196}
                height={96}
                className="h-9 w-auto"
                fetchPriority="high"
              />
            </button>
          ) : title ? (
            <h1 className="text-base font-semibold text-neutral-900">{title}</h1>
          ) : null}
        </div>

        <div className="ml-auto flex items-center justify-end gap-1">
          {rightSlot ?? (
            <>
              {showAccessibilityButton ? (
                <div ref={popoverRef} className="relative">
                  <button
                    ref={accessibilityTriggerRef}
                    type="button"
                    onClick={handleAccessibilityButtonClick}
                    aria-pressed={accessibilityActive}
                    aria-expanded={isPopoverOpen}
                    aria-haspopup="menu"
                    className={`inline-flex h-11 w-11 items-center justify-center rounded-md transition ${
                      accessibilityActive
                        ? 'bg-[#05C075]/10 text-[#05C075]'
                        : 'hover:bg-neutral-100'
                    }`}
                    aria-label="접근성 설정"
                  >
                    <PersonStanding aria-hidden="true" className="h-5 w-5" />
                  </button>

                  {isPopoverOpen ? (
                    <div
                      role="menu"
                      aria-label="접근성 설정 메뉴"
                      className="absolute top-full right-0 mt-1 rounded-lg border border-neutral-200 bg-white py-1 shadow-md"
                    >
                      <button
                        ref={accessibilityActionRef}
                        type="button"
                        onClick={handleAccessibilityAction}
                        role="menuitem"
                        className="w-full px-4 py-2 text-sm font-medium whitespace-nowrap text-neutral-900 hover:bg-neutral-50"
                      >
                        {accessibilityActive ? '접근성 모드 끄기' : '접근성 모드 켜기'}
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : null}
              <button
                type="button"
                onClick={handleNotificationsClick}
                className="relative inline-flex h-11 w-11 items-center justify-center rounded-md hover:bg-neutral-100"
                aria-label="알림 페이지 열기"
              >
                <Bell aria-hidden="true" className="h-5 w-5" />
                {showBadge ? (
                  <span className="absolute top-[0.5px] right-[0.5px] h-2.5 w-2.5 rounded-full bg-red-500" />
                ) : null}
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
