'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

import NotificationList from '@/components/notifications/NotificationList';
import { notificationKeys } from '@/lib/hooks/notifications/queryKeys';
import { useNotificationsInfiniteQuery } from '@/lib/hooks/notifications/useNotificationsInfiniteQuery';

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useNotificationsInfiniteQuery({ size: 10 });

  const notifications = data?.pages.flatMap((page) => page.notifications) ?? [];
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    queryClient.setQueryData(notificationKeys.unreadCount(), 0);
  }, [queryClient]);

  useEffect(() => {
    const element = sentinelRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.2, rootMargin: '200px' },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <main className="px-3 pt-4 pb-3">
      <NotificationList
        notifications={notifications}
        isLoading={isLoading}
        isError={isError}
        errorMessage={error instanceof Error ? error.message : '알림을 불러오지 못했습니다.'}
      />

      {isError ? (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700"
          >
            다시 시도
          </button>
        </div>
      ) : null}

      {!isError ? (
        <div ref={sentinelRef} className="mt-4 flex justify-center">
          {isFetchingNextPage ? (
            <span className="text-xs text-neutral-400">불러오는 중...</span>
          ) : hasNextPage ? (
            <span className="text-xs text-neutral-400">스크롤로 더 보기</span>
          ) : notifications.length > 0 ? (
            <span className="text-xs text-neutral-300">모든 알림을 확인했어요</span>
          ) : null}
        </div>
      ) : null}
    </main>
  );
}
