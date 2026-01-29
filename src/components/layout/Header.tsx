'use client';

import { Bell, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { useUnreadCountQuery } from '@/lib/hooks/notifications/useUnreadCountQuery';

import type { ReactNode } from 'react';

type HeaderProps = {
  title?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  rightSlot?: ReactNode;
};

export default function Header({
  title = 'Devths',
  showBackButton = false,
  onBackClick,
  rightSlot,
}: HeaderProps) {
  const router = useRouter();
  const { data: unreadCount } = useUnreadCountQuery();
  const showBadge = typeof unreadCount === 'number' && unreadCount > 0;
  const badgeText = unreadCount && unreadCount > 99 ? '99+' : String(unreadCount ?? '');

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6">
        <div className="flex w-10 items-center">
          {showBackButton ? (
            <button
              type="button"
              onClick={onBackClick}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-neutral-100"
              aria-label="뒤로가기"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          ) : null}
        </div>

        <h1 className="text-base font-semibold text-neutral-900">{title}</h1>

        <div className="flex w-10 items-center justify-end">
          {rightSlot ?? (
            <button
              type="button"
              onClick={() => router.push('/notifications')}
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-neutral-100"
              aria-label="알림"
            >
              <Bell className="h-5 w-5" />
              {showBadge ? (
                <span className="absolute -top-1 -right-1 inline-flex min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                  {badgeText}
                </span>
              ) : null}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
