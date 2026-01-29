'use client';

import NotificationItem from '@/components/notifications/NotificationItem';

import type { NotificationResponse } from '@/types/notifications';

type NotificationListProps = {
  notifications: NotificationResponse[];
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
};

function NotificationSkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((idx) => (
        <div
          key={idx}
          className="rounded-2xl border border-neutral-200 bg-white px-4 py-3"
        >
          <div className="flex items-center justify-between">
            <div className="h-3 w-20 animate-pulse rounded bg-neutral-200" />
            <div className="h-3 w-12 animate-pulse rounded bg-neutral-200" />
          </div>
          <div className="mt-3 space-y-2">
            <div className="h-3 w-full animate-pulse rounded bg-neutral-200" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-neutral-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function NotificationList({
  notifications,
  isLoading = false,
  isError = false,
  errorMessage,
}: NotificationListProps) {
  if (isLoading) {
    return <NotificationSkeleton />;
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-6 text-center text-sm text-red-600">
        {errorMessage ?? '알림을 불러오지 못했습니다.'}
      </div>
    );
  }

  if (!notifications || notifications.length === 0) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-6 text-center text-sm text-neutral-500">
        알림이 없어요
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
        <NotificationItem key={notification.notificationId} notification={notification} />
      ))}
    </div>
  );
}
