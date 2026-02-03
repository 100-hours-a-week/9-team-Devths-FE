'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';

import NotificationList from '@/components/notifications/NotificationList';
import { notificationKeys } from '@/lib/hooks/notifications/queryKeys';
import { useNotificationsInfiniteQuery } from '@/lib/hooks/notifications/useNotificationsInfiniteQuery';

export default function NotificationsPage() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [seenIds, setSeenIds] = useState<number[]>([]);
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const notifications = data?.pages.flatMap((page) => page.notifications) ?? [];
  const sentinelRef = useRef<HTMLDivElement>(null);
  const pendingSeenRef = useRef<Set<number>>(new Set());

  const seenIdSet = useMemo(() => new Set(seenIds), [seenIds]);

  useEffect(() => {
    const syncId = window.setTimeout(() => {
      setIsHydrated(true);
      try {
        const stored = window.localStorage.getItem('devths_seen_notifications');
        const parsed = stored ? (JSON.parse(stored) as number[]) : [];
        setSeenIds(Array.isArray(parsed) ? parsed : []);
      } catch {
        setSeenIds([]);
      }
    }, 0);
    return () => window.clearTimeout(syncId);
  }, []);

  useEffect(() => {
    if (!isHydrated || notifications.length === 0) return;
    for (const notification of notifications) {
      if (!notification.isRead && !seenIdSet.has(notification.notificationId)) {
        pendingSeenRef.current.add(notification.notificationId);
      }
    }
  }, [isHydrated, notifications, seenIdSet]);

  useEffect(() => {
    return () => {
      if (pendingSeenRef.current.size === 0) return;
      try {
        const stored = window.localStorage.getItem('devths_seen_notifications');
        const parsed = stored ? (JSON.parse(stored) as number[]) : [];
        const existing = new Set(Array.isArray(parsed) ? parsed : []);
        // eslint-disable-next-line react-hooks/exhaustive-deps
        pendingSeenRef.current.forEach((id) => existing.add(id));
        window.localStorage.setItem('devths_seen_notifications', JSON.stringify([...existing]));
      } catch {}

      const currentUnread = queryClient.getQueryData<number>(notificationKeys.unreadCount());
      if (typeof currentUnread === 'number') {
        queryClient.setQueryData(notificationKeys.unreadCount(), 0);
      }
      pendingSeenRef.current.clear();
    };
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

  const displayNotifications = useMemo(
    () =>
      notifications.map((notification) => ({
        ...notification,
        isRead: notification.isRead || seenIdSet.has(notification.notificationId),
      })),
    [notifications, seenIdSet],
  );

  return (
    <main className="px-3 pt-4 pb-3">
      <NotificationList
        notifications={displayNotifications}
        isLoading={!isHydrated || isLoading}
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
            <div className="flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1 text-[11px] font-semibold text-neutral-600">
              <span className="h-1.5 w-1.5 rounded-full bg-[#05C075]" />
              모든 알림을 확인했어요
            </div>
          ) : null}
        </div>
      ) : null}
    </main>
  );
}
