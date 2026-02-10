'use client';

import { Bell, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo } from 'react';

import { useHeader } from '@/components/layout/HeaderContext';
import { useNavigationGuard } from '@/components/layout/NavigationGuardContext';
import BoardPostDetailSkeleton from '@/screens/board/detail/BoardPostDetailSkeleton';

export default function BoardDetailPage() {
  const router = useRouter();
  const { setOptions, resetOptions } = useHeader();
  const { requestNavigation } = useNavigationGuard();

  const handleSearchClick = useCallback(() => {
    requestNavigation(() => router.push('/board/search'));
  }, [requestNavigation, router]);

  const handleNotificationsClick = useCallback(() => {
    requestNavigation(() => router.push('/notifications'));
  }, [requestNavigation, router]);

  const rightSlot = useMemo(
    () => (
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={handleSearchClick}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-neutral-100"
          aria-label="게시글 검색"
        >
          <Search className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={handleNotificationsClick}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-neutral-100"
          aria-label="알림"
        >
          <Bell className="h-5 w-5" />
        </button>
      </div>
    ),
    [handleNotificationsClick, handleSearchClick],
  );

  useEffect(() => {
    setOptions({
      title: 'Devths',
      showBackButton: false,
      rightSlot,
    });

    return () => resetOptions();
  }, [resetOptions, rightSlot, setOptions]);

  return <BoardPostDetailSkeleton />;
}
