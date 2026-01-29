'use client';

import NotificationList from '@/components/notifications/NotificationList';
import { useNotificationsInfiniteQuery } from '@/lib/hooks/notifications/useNotificationsInfiniteQuery';

export default function NotificationsPage() {
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

  return (
    <main className="px-3 pt-4 pb-3">
      <NotificationList
        notifications={notifications}
        isLoading={isLoading}
        isError={isError}
        errorMessage={
          error instanceof Error ? error.message : '알림을 불러오지 못했습니다.'
        }
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

      {!isLoading && !isError && hasNextPage ? (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 disabled:opacity-50"
          >
            {isFetchingNextPage ? '불러오는 중...' : '더 보기'}
          </button>
        </div>
      ) : null}
    </main>
  );
}
