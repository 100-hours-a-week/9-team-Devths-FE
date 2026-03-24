import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';

import { BOTTOM_CONFIRM_THRESHOLD, TOP_FETCH_THRESHOLD } from '@/constants/chat';
import { usePatchLastReadMutation } from '@/lib/hooks/chat/usePatchLastReadMutation';

import type { ChatMessageResponse } from '@/lib/api/chatMessages';

type Params = {
  roomId: number | null;
  messages: ChatMessageResponse[];
  unreadStartIndex: number;
  serverLastReadMsgId: number | null;
  latestMessageId: number | null;
  isMessagesLoading: boolean;
  isMessagesError: boolean;
  fetchNextPage: () => void;
  hasNextPage: boolean | undefined;
  isFetchingNextPage: boolean;
};

export function useChatScroll({
  roomId,
  messages,
  unreadStartIndex,
  serverLastReadMsgId,
  latestMessageId,
  isMessagesLoading,
  isMessagesError,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
}: Params) {
  const messageListRef = useRef<HTMLDivElement>(null);
  const unreadDividerRef = useRef<HTMLDivElement>(null);
  const initialScrollResyncTimerRef = useRef<number | null>(null);
  const hasInitialScrollRef = useRef(false);
  const hasNoUnreadInitialBottomResyncedRef = useRef(false);
  const isLoadingOlderRef = useRef(false);
  const prevScrollHeightRef = useRef(0);
  const hasPatchedOnEntryRef = useRef(false);
  const lastPatchedMsgIdRef = useRef<number | null>(null);

  const patchLastReadMutation = usePatchLastReadMutation(roomId ?? 0);

  // roomId 변경 시 스크롤 관련 ref 초기화 및 타이머 정리
  useEffect(() => {
    if (initialScrollResyncTimerRef.current !== null) {
      window.clearTimeout(initialScrollResyncTimerRef.current);
      initialScrollResyncTimerRef.current = null;
    }
    hasInitialScrollRef.current = false;
    hasNoUnreadInitialBottomResyncedRef.current = false;
    isLoadingOlderRef.current = false;
    prevScrollHeightRef.current = 0;
    hasPatchedOnEntryRef.current = false;
    lastPatchedMsgIdRef.current = null;
  }, [roomId]);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (initialScrollResyncTimerRef.current !== null) {
        window.clearTimeout(initialScrollResyncTimerRef.current);
        initialScrollResyncTimerRef.current = null;
      }
    };
  }, []);

  const patchLastReadOnce = useCallback(
    (targetMessageId: number) => {
      if (roomId === null) {
        return;
      }

      if (targetMessageId <= 0 || patchLastReadMutation.isPending) {
        return;
      }

      if (lastPatchedMsgIdRef.current !== null && targetMessageId <= lastPatchedMsgIdRef.current) {
        return;
      }

      patchLastReadMutation.mutate(targetMessageId, {
        onSuccess: () => {
          lastPatchedMsgIdRef.current = targetMessageId;
        },
      });
    },
    [patchLastReadMutation, roomId],
  );

  // 서버에서 받은 lastReadMsgId로 lastPatchedMsgIdRef 초기화
  useEffect(() => {
    if (serverLastReadMsgId === null) {
      return;
    }

    if (lastPatchedMsgIdRef.current === null) {
      lastPatchedMsgIdRef.current = serverLastReadMsgId;
    }
  }, [serverLastReadMsgId]);

  // 초기 스크롤 위치 설정 + 이전 메시지 로딩 시 스크롤 높이 보정
  useLayoutEffect(() => {
    const container = messageListRef.current;
    if (!container || messages.length === 0) {
      return;
    }

    if (!hasInitialScrollRef.current) {
      if (unreadStartIndex >= 0 && unreadDividerRef.current) {
        const dividerTop = unreadDividerRef.current.offsetTop;
        container.scrollTop = Math.max(0, dividerTop - container.clientHeight * 0.35);
      } else {
        container.scrollTop = container.scrollHeight;
        requestAnimationFrame(() => {
          const currentContainer = messageListRef.current;
          if (!currentContainer) {
            return;
          }
          currentContainer.scrollTop = currentContainer.scrollHeight;
        });
        if (initialScrollResyncTimerRef.current !== null) {
          window.clearTimeout(initialScrollResyncTimerRef.current);
        }
        initialScrollResyncTimerRef.current = window.setTimeout(() => {
          const currentContainer = messageListRef.current;
          if (!currentContainer) {
            return;
          }
          currentContainer.scrollTop = currentContainer.scrollHeight;
          initialScrollResyncTimerRef.current = null;
        }, 300);
      }
      hasInitialScrollRef.current = true;
      return;
    }

    if (isLoadingOlderRef.current) {
      const newScrollHeight = container.scrollHeight;
      const scrollDiff = newScrollHeight - prevScrollHeightRef.current;
      container.scrollTop += scrollDiff;
      isLoadingOlderRef.current = false;
    }
  }, [messages, unreadStartIndex]);

  // 읽지 않은 메시지 없을 때 초기 진입 하단 재동기화
  useEffect(() => {
    if (!hasInitialScrollRef.current) {
      return;
    }

    if (hasNoUnreadInitialBottomResyncedRef.current) {
      return;
    }

    if (messages.length === 0 || unreadStartIndex >= 0) {
      return;
    }

    const container = messageListRef.current;
    if (!container) {
      return;
    }

    hasNoUnreadInitialBottomResyncedRef.current = true;

    const timerId = window.setTimeout(() => {
      const currentContainer = messageListRef.current;
      if (!currentContainer) {
        return;
      }
      currentContainer.scrollTop = currentContainer.scrollHeight;
    }, 150);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [messages.length, unreadStartIndex]);

  // 진입 시 최신 메시지 lastRead 패치
  useEffect(() => {
    if (roomId === null || isMessagesLoading || isMessagesError || latestMessageId === null) {
      return;
    }

    if (hasPatchedOnEntryRef.current) {
      return;
    }

    hasPatchedOnEntryRef.current = true;
    patchLastReadOnce(latestMessageId);
  }, [isMessagesError, isMessagesLoading, latestMessageId, patchLastReadOnce, roomId]);

  const handleMessageScroll = useCallback(() => {
    const container = messageListRef.current;
    if (!container) {
      return;
    }

    const distanceFromBottom =
      container.scrollHeight - (container.scrollTop + container.clientHeight);
    if (distanceFromBottom <= BOTTOM_CONFIRM_THRESHOLD && latestMessageId !== null) {
      patchLastReadOnce(latestMessageId);
    }

    if (!hasNextPage || isFetchingNextPage) {
      return;
    }

    if (container.scrollTop > TOP_FETCH_THRESHOLD) {
      return;
    }

    prevScrollHeightRef.current = container.scrollHeight;
    isLoadingOlderRef.current = true;
    void fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, latestMessageId, patchLastReadOnce]);

  return {
    messageListRef,
    unreadDividerRef,
    handleMessageScroll,
    patchLastReadOnce,
  };
}
