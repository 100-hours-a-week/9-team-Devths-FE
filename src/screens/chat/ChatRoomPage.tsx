'use client';

import clsx from 'clsx';
import { Menu } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { useHeader } from '@/components/layout/HeaderContext';
import { getUserIdFromAccessToken } from '@/lib/auth/token';
import { useChatMessagesInfiniteQuery } from '@/lib/hooks/chat/useChatMessagesInfiniteQuery';
import { useChatRoomDetailQuery } from '@/lib/hooks/chat/useChatRoomDetailQuery';
import { toast } from '@/lib/toast/store';

import type { ChatMessageResponse } from '@/lib/api/chatMessages';

type ChatRoomPageProps = Readonly<{
  roomId: number | null;
}>;

const MESSAGE_PAGE_SIZE = 20;
const LONG_MESSAGE_THRESHOLD = 300;

function resolveTitle(roomName: string | null, title: string | null) {
  const trimmedRoomName = roomName?.trim();
  if (trimmedRoomName) {
    return trimmedRoomName;
  }

  const trimmedTitle = title?.trim();
  if (trimmedTitle) {
    return trimmedTitle;
  }

  return '채팅방';
}

function parseKstDateTime(value: string): Date {
  const normalized = value.includes(' ') ? value.replace(' ', 'T') : value;
  const hasTimezone = /([zZ]|[+-]\d{2}:\d{2})$/.test(normalized);
  if (hasTimezone) {
    return new Date(normalized);
  }

  return new Date(`${normalized}+09:00`);
}

function formatDateKey(value: string): string {
  const date = parseKstDateTime(value);
  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 10);
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatStickyDateLabel(value: string): string {
  const date = parseKstDateTime(value);
  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 10);
  }

  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });
}

function formatMessageTime(value: string): string {
  const date = parseKstDateTime(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function resolveMessageContent(message: ChatMessageResponse): string {
  if (message.type === 'IMAGE') {
    return '[이미지]';
  }

  if (message.type === 'FILE') {
    return '[파일]';
  }

  return message.content ?? '';
}

export default function ChatRoomPage({ roomId }: ChatRoomPageProps) {
  const router = useRouter();
  const { setOptions, resetOptions } = useHeader();
  const { data, isLoading, isError, refetch } = useChatRoomDetailQuery(roomId);
  const currentUserId = getUserIdFromAccessToken();
  const [expandedMessageIds, setExpandedMessageIds] = useState<Set<number>>(new Set());
  const messageListRef = useRef<HTMLDivElement>(null);
  const hasInitialScrollRef = useRef(false);
  const isLoadingOlderRef = useRef(false);
  const prevScrollHeightRef = useRef(0);

  const {
    data: messageData,
    isLoading: isMessagesLoading,
    isError: isMessagesError,
    refetch: refetchMessages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useChatMessagesInfiniteQuery({
    roomId: roomId ?? 0,
    size: MESSAGE_PAGE_SIZE,
  });

  const headerTitle = useMemo(
    () => resolveTitle(data?.roomName ?? null, data?.title ?? null),
    [data?.roomName, data?.title],
  );

  const messages = useMemo(() => {
    const pages = messageData?.pages ?? [];
    const merged = [...pages].reverse().flatMap((page) => page.messages);
    const seen = new Set<number>();

    return merged.filter((message) => {
      if (seen.has(message.messageId)) {
        return false;
      }
      seen.add(message.messageId);
      return true;
    });
  }, [messageData?.pages]);

  const toggleExpandedMessage = useCallback((messageId: number) => {
    setExpandedMessageIds((prev) => {
      const next = new Set(prev);
      if (next.has(messageId)) {
        next.delete(messageId);
      } else {
        next.add(messageId);
      }
      return next;
    });
  }, []);

  const handleBackClick = useCallback(() => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }
    router.push('/chat');
  }, [router]);

  const handleSettingsClick = useCallback(() => {
    toast('채팅방 설정 화면 준비 중입니다.');
  }, []);

  const rightSlot = useMemo(
    () => (
      <button
        type="button"
        onClick={handleSettingsClick}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-neutral-100"
        aria-label="채팅방 설정"
      >
        <Menu className="h-5 w-5" />
      </button>
    ),
    [handleSettingsClick],
  );

  useEffect(() => {
    setOptions({
      title: headerTitle,
      showBackButton: true,
      onBackClick: handleBackClick,
      rightSlot,
    });

    return () => resetOptions();
  }, [handleBackClick, headerTitle, resetOptions, rightSlot, setOptions]);

  useEffect(() => {
    hasInitialScrollRef.current = false;
    isLoadingOlderRef.current = false;
    prevScrollHeightRef.current = 0;
  }, [roomId]);

  useLayoutEffect(() => {
    const container = messageListRef.current;
    if (!container || messages.length === 0) {
      return;
    }

    if (!hasInitialScrollRef.current) {
      container.scrollTop = container.scrollHeight;
      hasInitialScrollRef.current = true;
      return;
    }

    if (isLoadingOlderRef.current) {
      const newScrollHeight = container.scrollHeight;
      const scrollDiff = newScrollHeight - prevScrollHeightRef.current;
      container.scrollTop += scrollDiff;
      isLoadingOlderRef.current = false;
    }
  }, [messages]);

  const handleMessageScroll = useCallback(() => {
    const container = messageListRef.current;
    if (!container) {
      return;
    }

    if (!hasNextPage || isFetchingNextPage) {
      return;
    }

    if (container.scrollTop > 80) {
      return;
    }

    prevScrollHeightRef.current = container.scrollHeight;
    isLoadingOlderRef.current = true;
    void fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (roomId === null) {
    return (
      <main className="px-3 pt-4 pb-3">
        <div className="flex h-[50vh] flex-col items-center justify-center gap-3 rounded-2xl border border-neutral-200 bg-white">
          <p className="text-sm font-semibold text-neutral-900">유효하지 않은 채팅방입니다.</p>
          <button
            type="button"
            onClick={() => router.push('/chat')}
            className="rounded-lg bg-neutral-900 px-3 py-2 text-xs font-semibold text-white"
          >
            채팅 목록으로 이동
          </button>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="px-3 pt-4 pb-3">
        <div className="space-y-2 rounded-2xl border border-neutral-200 bg-white p-4">
          <div className="h-4 w-24 animate-pulse rounded bg-neutral-200" />
          <div className="h-4 w-40 animate-pulse rounded bg-neutral-200" />
          <div className="h-20 animate-pulse rounded-xl bg-neutral-100" />
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="px-3 pt-4 pb-3">
        <div className="flex h-[50vh] flex-col items-center justify-center gap-3 rounded-2xl border border-neutral-200 bg-white">
          <p className="text-sm font-semibold text-neutral-900">
            채팅방 정보를 불러올 수 없습니다.
          </p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="rounded-lg bg-neutral-900 px-3 py-2 text-xs font-semibold text-white"
          >
            다시 시도
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="px-3 pt-4 pb-3">
      <section
        ref={messageListRef}
        onScroll={handleMessageScroll}
        className="overflow-y-auto rounded-2xl border border-neutral-200 bg-neutral-50 p-3"
        style={{
          height: 'calc(100dvh - 56px - var(--bottom-nav-h) - 28px)',
        }}
      >
        {hasNextPage ? (
          <div className="pb-2 text-center text-[11px] text-neutral-400">
            {isFetchingNextPage ? '이전 메시지를 불러오는 중...' : '위로 스크롤하면 이전 메시지를 불러옵니다'}
          </div>
        ) : null}

        {isMessagesLoading ? (
          <div className="space-y-2 py-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className={clsx(
                  'flex',
                  index % 2 === 0 ? 'justify-start' : 'justify-end',
                )}
              >
                <div className="h-16 w-[70%] animate-pulse rounded-2xl bg-neutral-200" />
              </div>
            ))}
          </div>
        ) : null}

        {!isMessagesLoading && isMessagesError ? (
          <div className="flex h-full min-h-[240px] flex-col items-center justify-center gap-3 rounded-2xl bg-white">
            <p className="text-sm font-semibold text-neutral-900">메시지를 불러올 수 없습니다.</p>
            <button
              type="button"
              onClick={() => void refetchMessages()}
              className="rounded-lg bg-neutral-900 px-3 py-2 text-xs font-semibold text-white"
            >
              다시 시도
            </button>
          </div>
        ) : null}

        {!isMessagesLoading && !isMessagesError && messages.length === 0 ? (
          <div className="flex h-full min-h-[240px] items-center justify-center rounded-2xl bg-white text-sm text-neutral-500">
            아직 메시지가 없습니다.
          </div>
        ) : null}

        {!isMessagesLoading && !isMessagesError && messages.length > 0 ? (
          <div className="space-y-2 pb-4">
            {messages.map((message, index) => {
              const prevMessage = index > 0 ? messages[index - 1] : null;
              const shouldShowDateSeparator =
                prevMessage === null ||
                formatDateKey(prevMessage.createdAt) !== formatDateKey(message.createdAt);
              const isMine = message.sender?.userId === currentUserId;
              const isLongText =
                !message.isDeleted &&
                message.type === 'TEXT' &&
                (message.content?.length ?? 0) > LONG_MESSAGE_THRESHOLD;
              const isExpanded = expandedMessageIds.has(message.messageId);
              const fullContent = resolveMessageContent(message);
              const displayedContent =
                isLongText && !isExpanded
                  ? `${fullContent.slice(0, LONG_MESSAGE_THRESHOLD)}...`
                  : fullContent;

              return (
                <div key={message.messageId}>
                  {shouldShowDateSeparator ? (
                    <div className="sticky top-14 z-10 my-2 flex justify-center">
                      <span className="rounded-full border border-neutral-200 bg-white/95 px-3 py-1 text-[11px] font-medium text-neutral-600">
                        {formatStickyDateLabel(message.createdAt)}
                      </span>
                    </div>
                  ) : null}

                  <div className={clsx('mt-2 flex', isMine ? 'justify-end' : 'justify-start')}>
                    <div className={clsx('max-w-[78%]', message.type === 'SYSTEM' ? 'max-w-full' : '')}>
                      {!isMine && message.type !== 'SYSTEM' && message.sender?.nickname ? (
                        <p className="mb-1 px-1 text-[11px] text-neutral-500">
                          {message.sender.nickname}
                        </p>
                      ) : null}

                      {message.type === 'SYSTEM' ? (
                        <div className="mx-auto rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-center text-[11px] text-neutral-600">
                          {message.isDeleted ? '삭제된 시스템 메시지입니다.' : displayedContent}
                        </div>
                      ) : (
                        <div
                          className={clsx(
                            'rounded-2xl border px-3 py-2',
                            message.isDeleted
                              ? 'border-neutral-200 bg-neutral-100'
                              : isMine
                                ? 'border-[#0F172A] bg-[#0F172A] text-white'
                                : 'border-neutral-200 bg-white text-neutral-900',
                          )}
                        >
                          <p
                            className={clsx(
                              'whitespace-pre-wrap break-words text-sm',
                              message.isDeleted ? 'text-neutral-400' : '',
                            )}
                          >
                            {message.isDeleted ? '삭제된 메시지입니다.' : displayedContent}
                          </p>

                          {!message.isDeleted && isLongText ? (
                            <button
                              type="button"
                              onClick={() => toggleExpandedMessage(message.messageId)}
                              className={clsx(
                                'mt-1 text-[11px] font-semibold',
                                isMine ? 'text-neutral-200' : 'text-neutral-500',
                              )}
                            >
                              {isExpanded ? '접기' : '더보기'}
                            </button>
                          ) : null}
                        </div>
                      )}

                      <p className="mt-1 px-1 text-right text-[11px] text-neutral-400">
                        {formatMessageTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </section>
    </main>
  );
}
