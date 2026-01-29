'use client';

import { formatNotificationDate } from '@/lib/utils/notifications';

import type { NotificationResponse } from '@/types/notifications';

type NotificationItemProps = {
  notification: NotificationResponse;
};

export default function NotificationItem({ notification }: NotificationItemProps) {
  const senderName = notification.sender?.senderName ?? '시스템';
  const formattedDate = formatNotificationDate(notification.createdAt);

  return (
    <article
      className={
        notification.isRead
          ? 'rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-500'
          : 'rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-neutral-900'
      }
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
    </article>
  );
}
