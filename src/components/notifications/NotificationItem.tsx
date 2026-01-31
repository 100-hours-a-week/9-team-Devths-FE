'use client';

import { useRouter } from 'next/navigation';

import { formatNotificationDate } from '@/lib/utils/notifications';

import type { NotificationResponse } from '@/types/notifications';

type NotificationItemProps = {
  notification: NotificationResponse;
};

function normalizeTargetPath(path: string) {
  const trimmed = path.trim();
  if (!trimmed) return '/notifications';
  if (trimmed.startsWith('/')) return trimmed;
  return `/${trimmed}`;
}

function resolveNotificationPath(notification: NotificationResponse) {
  const normalized = normalizeTargetPath(notification.targetPath);

  // backend → frontend route mapping
  if (normalized.startsWith('/ai/chat/')) {
    const roomId = normalized.replace('/ai/chat/', '').split('?')[0];
    return `/llm/${roomId}?rid=${roomId}`;
  }

  if (normalized.startsWith('/llm/result/')) {
    const roomId = normalized.replace('/llm/result/', '').split('?')[0];
    return `/llm/${roomId}/result`;
  }

  if (normalized.startsWith('/llm/analysis/')) {
    const roomId = normalized.replace('/llm/analysis/', '').split('?')[0];
    return `/llm/${roomId}/analysis`;
  }

  if (normalized.startsWith('/llm/room/')) {
    const roomId = normalized.replace('/llm/room/', '').split('?')[0];
    return `/llm/${roomId}`;
  }

  return normalized;
}

export default function NotificationItem({ notification }: NotificationItemProps) {
  const router = useRouter();
  const senderName = notification.sender?.senderName ?? '시스템';
  const formattedDate = formatNotificationDate(notification.createdAt);
  const isUnread = !notification.isRead;

  return (
    <button
      type="button"
      onClick={() => router.push(resolveNotificationPath(notification))}
      className={
        isUnread
          ? 'w-full rounded-2xl border border-[#05C075] bg-white px-4 py-3 text-left text-neutral-900'
          : 'w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-left text-neutral-500'
      }
      aria-label="알림 상세 이동"
    >
      <div className="flex items-center justify-between gap-3">
        <span
          className={
            isUnread
              ? 'text-xs font-semibold text-neutral-600'
              : 'text-xs font-semibold text-neutral-400'
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
