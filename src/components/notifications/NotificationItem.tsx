'use client';

import { formatNotificationDate } from '@/lib/utils/notifications';
import { useRouter } from 'next/navigation';

import type { NotificationResponse } from '@/types/notifications';

type NotificationItemProps = {
  notification: NotificationResponse;
};

export default function NotificationItem({ notification }: NotificationItemProps) {
  const router = useRouter();
  const senderName = notification.sender?.senderName ?? '시스템';
  const formattedDate = formatNotificationDate(notification.createdAt);

  return (
    <button
      type="button"
      onClick={() => router.push(notification.targetPath)}
      className={
        notification.isRead
          ? 'w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-left text-neutral-500'
          : 'w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-left text-neutral-900'
      }
      aria-label="알림 상세 이동"
    >
      <div className="flex items-center justify-between gap-3">
        <span
          className={
            notification.isRead
              ? 'text-xs font-semibold text-neutral-400'
              : 'text-xs font-semibold text-neutral-500'
          }
        >
          {senderName}
        </span>
        <span className="text-[11px] text-neutral-400">{formattedDate}</span>
      </div>
      <p className="mt-2 text-sm leading-5">{notification.content}</p>
    </button>
  );
}
