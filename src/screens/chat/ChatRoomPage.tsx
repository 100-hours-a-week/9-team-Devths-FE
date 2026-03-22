'use client';

import { useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import {
  FileImage,
  FileText,
  Loader2,
  Menu,
  MessageSquarePlus,
  Paperclip,
  SendHorizonal,
  Trash2,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from 'react';

import ConfirmModal from '@/components/common/ConfirmModal';
import { useAppFrame } from '@/components/layout/AppFrameContext';
import { useHeader } from '@/components/layout/HeaderContext';
import {
  BOTTOM_CONFIRM_THRESHOLD,
  DELETE_LONG_PRESS_MS,
  LONG_MESSAGE_THRESHOLD,
  MESSAGE_PAGE_SIZE,
  MESSAGE_SEND_DESTINATION,
} from '@/constants/chat';
import { getUserIdFromAccessToken } from '@/lib/auth/token';
import { applyRealtimeRoomMessage } from '@/lib/chat/realtimeMessageCache';
import { applyRealtimeRoomNotification } from '@/lib/chat/realtimeRoomCache';
import { clearRejoinedRoomUiOverride } from '@/lib/chat/rejoinedRoomUiCache';
import { chatStompManager } from '@/lib/chat/stompManager';
import { ApiError } from '@/lib/errors/ApiError';
import { useAccessibilityMode } from '@/lib/hooks/accessibility/useAccessibilityMode';
import { chatKeys } from '@/lib/hooks/chat/queryKeys';
import { useAttachmentHandler } from '@/lib/hooks/chat/useAttachmentHandler';
import { useChatMessagesInfiniteQuery } from '@/lib/hooks/chat/useChatMessagesInfiniteQuery';
import { useChatRoomDetailQuery } from '@/lib/hooks/chat/useChatRoomDetailQuery';
import { useChatScroll } from '@/lib/hooks/chat/useChatScroll';
import { useChatSubscriptions } from '@/lib/hooks/chat/useChatSubscriptions';
import { useDeleteMessageMutation } from '@/lib/hooks/chat/useDeleteMessageMutation';
import { useLeaveChatRoomMutation } from '@/lib/hooks/chat/useLeaveChatRoomMutation';
import { usePutRoomSettingsMutation } from '@/lib/hooks/chat/usePutRoomSettingsMutation';
import { toast } from '@/lib/toast/store';
import { formatDateKey, formatMessageTime, formatStickyDateLabel } from '@/lib/utils/chatDate';

import type { ChatMessageResponse, SendChatMessagePayload } from '@/lib/api/chatMessages';
import type { IMessage } from '@stomp/stompjs';

const OVERLAY_FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getFocusableElements(container: HTMLElement | null): HTMLElement[] {
  if (!container) {
    return [];
  }

  return Array.from(container.querySelectorAll<HTMLElement>(OVERLAY_FOCUSABLE_SELECTOR));
}

function focusFirstElement(container: HTMLElement | null) {
  const focusables = getFocusableElements(container);
  if (focusables.length > 0) {
    focusables[0]?.focus();
    return;
  }

  container?.focus();
}

function trapFocus(event: KeyboardEvent, container: HTMLElement | null) {
  const focusables = getFocusableElements(container);
  if (focusables.length === 0) {
    event.preventDefault();
    return;
  }

  const first = focusables[0];
  const last = focusables[focusables.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last?.focus();
    return;
  }

  if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first?.focus();
  }
}

type ChatRoomPageProps = Readonly<{
  roomId: number | null;
  mode?: 'room' | 'settings';
}>;

function resolveChatAssetUrl(s3KeyOrUrl: string | null): string | null {
  if (!s3KeyOrUrl) {
    return null;
  }

  if (/^https?:\/\//i.test(s3KeyOrUrl)) {
    return s3KeyOrUrl;
  }

  const base = process.env.NEXT_PUBLIC_S3_URL?.trim();
  if (!base) {
    return null;
  }

  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const normalizedKey = s3KeyOrUrl.startsWith('/') ? s3KeyOrUrl.slice(1) : s3KeyOrUrl;
  return `${normalizedBase}/${normalizedKey}`;
}

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

function resolveMessageContent(message: ChatMessageResponse): string {
  if (message.type === 'IMAGE') {
    return '[이미지]';
  }

  if (message.type === 'FILE' || message.type === 'PDF') {
    return '[파일]';
  }

  return message.content ?? '';
}

function resolveLastMessagePreview(message: ChatMessageResponse): string {
  const preview = resolveMessageContent(message).trim();
  return preview || '(내용 없음)';
}

function parseStompJson<T>(body: string): T | null {
  try {
    return JSON.parse(body) as T;
  } catch {
    return null;
  }
}

export default function ChatRoomPage({ roomId, mode = 'room' }: ChatRoomPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { setOptions: setFrameOptions, resetOptions: resetFrameOptions } = useAppFrame();
  const { setOptions, resetOptions } = useHeader();
  const { isOn: isAccessibilityOn } = useAccessibilityMode();
  const currentUserId = getUserIdFromAccessToken();
  const [messageInput, setMessageInput] = useState('');
  const [expandedMessageIds, setExpandedMessageIds] = useState<Set<number>>(new Set());
  const [deleteTargetMessageId, setDeleteTargetMessageId] = useState<number | null>(null);
  const [isLeaveConfirmOpen, setIsLeaveConfirmOpen] = useState(false);
  const [isLeavingRoom, setIsLeavingRoom] = useState(false);
  const [roomNameInput, setRoomNameInput] = useState('');
  const [isAlarmOnInput, setIsAlarmOnInput] = useState(true);
  const [imagePreview, setImagePreview] = useState<{
    src: string;
    alt: string;
  } | null>(null);
  const [liveAnnouncement, setLiveAnnouncement] = useState('');
  const isSettingsPage = mode === 'settings';
  const activeRoomId = isLeavingRoom ? null : roomId;
  const { data, isLoading, isError, refetch } = useChatRoomDetailQuery(activeRoomId);
  const deleteLongPressTimerRef = useRef<number | null>(null);
  const isMessageInputComposingRef = useRef(false);
  const liveAnnouncementTimerRef = useRef<number | null>(null);
  const attachmentTriggerRef = useRef<HTMLButtonElement | null>(null);
  const imagePreviewRestoreFocusRef = useRef<HTMLElement | null>(null);
  const imagePreviewDialogRef = useRef<HTMLDivElement | null>(null);
  const attachmentPickerDialogRef = useRef<HTMLElement | null>(null);
  const settingsDialogRef = useRef<HTMLDivElement | null>(null);
  const deleteMessageMutation = useDeleteMessageMutation(roomId ?? 0);
  const putRoomSettingsMutation = usePutRoomSettingsMutation(roomId ?? 0);
  const leaveChatRoomMutation = useLeaveChatRoomMutation(roomId ?? 0);

  const {
    data: messageData,
    isLoading: isMessagesLoading,
    isError: isMessagesError,
    refetch: refetchMessages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useChatMessagesInfiniteQuery({
    roomId: isLeavingRoom ? 0 : (roomId ?? 0),
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

  const serverLastReadMsgId = messageData?.pages[0]?.lastReadMsgId ?? null;
  const latestMessageId = messages.length > 0 ? messages[messages.length - 1].messageId : null;
  const unreadStartIndex = useMemo(() => {
    if (serverLastReadMsgId === null) {
      return -1;
    }

    return messages.findIndex(
      (message) =>
        message.messageId > serverLastReadMsgId && message.sender?.userId !== currentUserId,
    );
  }, [currentUserId, messages, serverLastReadMsgId]);

  const isPrivateRoom = data?.type === 'PRIVATE';

  const { messageListRef, unreadDividerRef, handleMessageScroll, patchLastReadOnce } =
    useChatScroll({
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
    });

  const {
    isAttachmentUploading,
    isAttachmentPickerOpen,
    setIsAttachmentPickerOpen,
    attachmentValidationMessage,
    setAttachmentValidationMessage,
    imageAttachmentInputRef,
    fileAttachmentInputRef,
    handleAttachmentButtonClick,
    handlePickImageAttachments,
    handlePickFileAttachment,
    handleAttachmentChange,
  } = useAttachmentHandler({ roomId, queryClient });

  const announceForScreenReader = useCallback(
    (message: string) => {
      if (!isAccessibilityOn) {
        return;
      }

      if (liveAnnouncementTimerRef.current !== null) {
        window.clearTimeout(liveAnnouncementTimerRef.current);
      }

      setLiveAnnouncement('');
      liveAnnouncementTimerRef.current = window.setTimeout(() => {
        setLiveAnnouncement(message);
      }, 20);
    },
    [isAccessibilityOn],
  );

  const closeImagePreview = useCallback(() => {
    setImagePreview(null);
    requestAnimationFrame(() => {
      imagePreviewRestoreFocusRef.current?.focus();
    });
  }, []);

  const openImagePreview = useCallback((preview: { src: string; alt: string }) => {
    imagePreviewRestoreFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setImagePreview(preview);
  }, []);

  const closeAttachmentPicker = useCallback(() => {
    setIsAttachmentPickerOpen(false);
    requestAnimationFrame(() => {
      attachmentTriggerRef.current?.focus();
    });
  }, [setIsAttachmentPickerOpen]);

  const handleAttachmentTriggerClick = useCallback(() => {
    handleAttachmentButtonClick();
  }, [handleAttachmentButtonClick]);

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

  const handleRealtimeRoomMessage = useCallback(
    (frame: IMessage) => {
      if (roomId === null) {
        return;
      }

      const incomingMessage = parseStompJson<ChatMessageResponse>(frame.body);
      if (!incomingMessage || typeof incomingMessage.messageId !== 'number') {
        return;
      }

      const roomUpdated = applyRealtimeRoomNotification(queryClient, {
        roomId,
        lastMessageContent: resolveLastMessagePreview(incomingMessage),
        lastMessageAt: incomingMessage.createdAt,
      });
      clearRejoinedRoomUiOverride(queryClient, roomId);
      if (!roomUpdated) {
        void queryClient.invalidateQueries({ queryKey: chatKeys.rooms() });
        void queryClient.refetchQueries({ queryKey: chatKeys.rooms(), type: 'all' });
      }

      const container = messageListRef.current;
      const shouldStickToBottom =
        !container ||
        container.scrollHeight - (container.scrollTop + container.clientHeight) <=
          BOTTOM_CONFIRM_THRESHOLD;

      applyRealtimeRoomMessage(queryClient, {
        roomId,
        size: MESSAGE_PAGE_SIZE,
        message: incomingMessage,
      });

      if (shouldStickToBottom) {
        requestAnimationFrame(() => {
          const updatedContainer = messageListRef.current;
          if (!updatedContainer) {
            return;
          }

          updatedContainer.scrollTop = updatedContainer.scrollHeight;
          if (incomingMessage.sender?.userId !== currentUserId) {
            patchLastReadOnce(incomingMessage.messageId);
          }
        });
      }

      if (incomingMessage.sender?.userId !== currentUserId) {
        const announcedType =
          incomingMessage.type === 'IMAGE'
            ? '새 이미지 메시지'
            : incomingMessage.type === 'FILE' || incomingMessage.type === 'PDF'
              ? '새 파일 메시지'
              : '새 메시지';
        announceForScreenReader(`${announcedType}가 도착했습니다.`);
      }
    },
    [
      announceForScreenReader,
      currentUserId,
      messageListRef,
      patchLastReadOnce,
      queryClient,
      roomId,
    ],
  );

  const handleSendMessage = useCallback(
    (event?: FormEvent<HTMLFormElement>) => {
      event?.preventDefault();

      if (roomId === null) {
        return;
      }

      const trimmedContent = messageInput.trim();
      if (!trimmedContent) {
        return;
      }

      const payload: SendChatMessagePayload = {
        roomId,
        type: 'TEXT',
        content: trimmedContent,
        s3Key: null,
      };

      const published = chatStompManager.publishJson(MESSAGE_SEND_DESTINATION, payload);
      if (!published) {
        toast('메시지 전송에 실패했습니다. 잠시 후 다시 시도해 주세요.');
        return;
      }

      setMessageInput('');
    },
    [messageInput, roomId],
  );

  useChatSubscriptions({
    enabled: !isLeavingRoom && roomId !== null,
    roomId,
    userId: null,
    onRoomMessage: handleRealtimeRoomMessage,
  });

  const clearDeleteLongPressTimer = useCallback(() => {
    if (deleteLongPressTimerRef.current !== null) {
      window.clearTimeout(deleteLongPressTimerRef.current);
      deleteLongPressTimerRef.current = null;
    }
  }, []);

  const startDeleteLongPress = useCallback(
    (messageId: number) => {
      clearDeleteLongPressTimer();
      deleteLongPressTimerRef.current = window.setTimeout(() => {
        setDeleteTargetMessageId(messageId);
      }, DELETE_LONG_PRESS_MS);
    },
    [clearDeleteLongPressTimer],
  );

  const handleDeleteMessage = useCallback(async () => {
    if (deleteTargetMessageId === null || deleteMessageMutation.isPending) {
      return;
    }

    try {
      await deleteMessageMutation.mutateAsync(deleteTargetMessageId);
      toast('메시지가 삭제되었습니다.');
      announceForScreenReader('메시지가 삭제되었습니다.');
      setDeleteTargetMessageId(null);
    } catch (error) {
      const err = ApiError.fromUnknown(error);
      toast(err.serverMessage ?? '메시지 삭제에 실패했습니다.');
      announceForScreenReader(err.serverMessage ?? '메시지 삭제에 실패했습니다.');
    }
  }, [announceForScreenReader, deleteMessageMutation, deleteTargetMessageId]);

  const handleSaveRoomSettings = useCallback(async () => {
    if (roomId === null || putRoomSettingsMutation.isPending) {
      return;
    }

    const trimmedRoomName = roomNameInput.trim();

    try {
      await putRoomSettingsMutation.mutateAsync({
        isAlarmOn: isAlarmOnInput,
        roomName: isPrivateRoom ? undefined : trimmedRoomName || undefined,
      });
      toast('채팅방 설정이 저장되었습니다.');
      announceForScreenReader('채팅방 설정이 저장되었습니다.');
      const params = new URLSearchParams();
      const from = searchParams.get('from');
      if (from) {
        params.set('from', from);
      }
      const suffix = params.toString();
      router.push(`/chat/${roomId}${suffix ? `?${suffix}` : ''}`);
    } catch (error) {
      const err = ApiError.fromUnknown(error);
      toast(err.serverMessage ?? '채팅방 설정 저장에 실패했습니다.');
      announceForScreenReader(err.serverMessage ?? '채팅방 설정 저장에 실패했습니다.');
    }
  }, [
    announceForScreenReader,
    isAlarmOnInput,
    isPrivateRoom,
    putRoomSettingsMutation,
    roomId,
    roomNameInput,
    router,
    searchParams,
  ]);

  const handleLeaveChatRoom = useCallback(async () => {
    if (roomId === null || leaveChatRoomMutation.isPending) {
      return;
    }

    try {
      setIsLeavingRoom(true);
      await leaveChatRoomMutation.mutateAsync();
      setIsLeaveConfirmOpen(false);
      toast('채팅방에서 나갔습니다.');
      announceForScreenReader('채팅방에서 나갔습니다.');
      router.push('/chat');
    } catch (error) {
      setIsLeavingRoom(false);
      const err = ApiError.fromUnknown(error);
      toast(err.serverMessage ?? '채팅방 나가기에 실패했습니다.');
      announceForScreenReader(err.serverMessage ?? '채팅방 나가기에 실패했습니다.');
    }
  }, [announceForScreenReader, leaveChatRoomMutation, roomId, router]);

  const handleCloseSettings = useCallback(() => {
    if (putRoomSettingsMutation.isPending) {
      return;
    }
    if (roomId === null) {
      return;
    }

    const params = new URLSearchParams();
    const from = searchParams.get('from');
    if (from) {
      params.set('from', from);
    }
    const suffix = params.toString();
    router.push(`/chat/${roomId}${suffix ? `?${suffix}` : ''}`);
  }, [putRoomSettingsMutation.isPending, roomId, router, searchParams]);

  const handleBackClick = useCallback(() => {
    const from = searchParams.get('from');
    const backPath =
      from === 'notifications' ? '/notifications' : from === 'board' ? '/board' : '/chat';
    void queryClient.invalidateQueries({ queryKey: chatKeys.rooms() });
    router.replace(backPath);
  }, [queryClient, router, searchParams]);

  const handleSettingsClick = useCallback(() => {
    if (roomId === null) {
      return;
    }

    const params = new URLSearchParams();
    const from = searchParams.get('from');
    if (from) {
      params.set('from', from);
    }
    router.push(`/chat/${roomId}/settings${params.toString() ? `?${params.toString()}` : ''}`);
  }, [roomId, router, searchParams]);

  const rightSlot = useMemo(
    () => (
      <button
        type="button"
        onClick={handleSettingsClick}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-neutral-100"
        aria-label="채팅방 설정 열기"
      >
        <Menu aria-hidden="true" className="h-5 w-5" />
      </button>
    ),
    [handleSettingsClick],
  );
  const settingsRightSlot = useMemo(() => <div className="h-9 w-9" aria-hidden="true" />, []);

  useEffect(() => {
    setFrameOptions({ showBottomNav: false });
    return () => resetFrameOptions();
  }, [resetFrameOptions, setFrameOptions]);

  useEffect(() => {
    setOptions({
      title: isSettingsPage ? '채팅방 설정' : headerTitle,
      showBackButton: true,
      onBackClick: isSettingsPage ? handleCloseSettings : handleBackClick,
      rightSlot: isSettingsPage ? settingsRightSlot : rightSlot,
    });

    return () => resetOptions();
  }, [
    handleBackClick,
    handleCloseSettings,
    headerTitle,
    isSettingsPage,
    resetOptions,
    rightSlot,
    settingsRightSlot,
    setOptions,
  ]);

  useEffect(() => {
    startTransition(() => {
      setIsLeavingRoom(false);
      setMessageInput('');
    });
  }, [roomId]);

  useEffect(() => {
    if (roomId === null) {
      return;
    }

    queryClient.setQueryData<Record<number, boolean>>(chatKeys.realtimeUnreadRooms(), (prev) => ({
      ...(prev ?? {}),
      [roomId]: false,
    }));
  }, [queryClient, roomId]);

  useEffect(() => {
    startTransition(() => {
      setRoomNameInput(data?.roomName ?? '');
      setIsAlarmOnInput(data?.isAlarmOn ?? true);
    });
  }, [data?.isAlarmOn, data?.roomName, roomId]);

  useEffect(() => {
    return () => {
      clearDeleteLongPressTimer();
      if (liveAnnouncementTimerRef.current !== null) {
        window.clearTimeout(liveAnnouncementTimerRef.current);
      }
    };
  }, [clearDeleteLongPressTimer]);

  useEffect(() => {
    if (!isAccessibilityOn || !imagePreview) {
      return;
    }

    const dialog = imagePreviewDialogRef.current;
    requestAnimationFrame(() => {
      focusFirstElement(dialog);
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeImagePreview();
        return;
      }

      if (event.key === 'Tab') {
        trapFocus(event, dialog);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closeImagePreview, imagePreview, isAccessibilityOn]);

  useEffect(() => {
    if (!isAccessibilityOn || !isAttachmentPickerOpen) {
      return;
    }

    const dialog = attachmentPickerDialogRef.current;
    requestAnimationFrame(() => {
      focusFirstElement(dialog);
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeAttachmentPicker();
        return;
      }

      if (event.key === 'Tab') {
        trapFocus(event, dialog);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closeAttachmentPicker, isAccessibilityOn, isAttachmentPickerOpen]);

  useEffect(() => {
    if (!isAccessibilityOn || !isSettingsPage) {
      return;
    }

    const dialog = settingsDialogRef.current;
    requestAnimationFrame(() => {
      focusFirstElement(dialog);
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        handleCloseSettings();
        return;
      }

      if (event.key === 'Tab') {
        trapFocus(event, dialog);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleCloseSettings, isAccessibilityOn, isSettingsPage]);

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
    <main className="-mx-4 flex h-[calc(100dvh-56px-var(--bottom-nav-h))] flex-col sm:-mx-6">
      {isAccessibilityOn ? (
        <div className="sr-only" aria-live="assertive" aria-atomic="true">
          {liveAnnouncement}
        </div>
      ) : null}
      <section
        ref={messageListRef}
        onScroll={handleMessageScroll}
        className="min-h-0 flex-1 overflow-y-auto bg-white px-4 py-4"
      >
        {hasNextPage ? (
          <div className="pb-2 text-center text-[11px] text-neutral-400">
            {isFetchingNextPage
              ? '이전 메시지를 불러오는 중...'
              : '위로 스크롤하면 이전 메시지를 불러옵니다'}
          </div>
        ) : null}

        {isMessagesLoading ? (
          <div className="space-y-2 py-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className={clsx('flex', index % 2 === 0 ? 'justify-start' : 'justify-end')}
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
          <div className="flex h-full min-h-[240px] flex-col items-center justify-center px-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#00C473]/10">
              <MessageSquarePlus aria-hidden="true" className="h-8 w-8 text-[#00C473]" strokeWidth={1.75} />
            </div>
            <p className="mt-5 text-base font-semibold text-[#191F28]">아직 메시지가 없습니다.</p>
            <p className="mt-2 text-sm text-[#8B95A1]">첫 메시지를 보내 대화를 시작해보세요</p>
          </div>
        ) : null}

        {!isMessagesLoading && !isMessagesError && messages.length > 0 ? (
          <div className="space-y-2 pb-4">
            {messages.map((message, index) => {
              const prevMessage = index > 0 ? messages[index - 1] : null;
              const shouldShowDateSeparator =
                prevMessage === null ||
                formatDateKey(prevMessage.createdAt) !== formatDateKey(message.createdAt);
              const shouldShowLastReadDivider = index === unreadStartIndex;
              const isMine = message.sender?.userId === currentUserId;
              const shouldShowCounterpartAvatar =
                isPrivateRoom && !isMine && message.type !== 'SYSTEM';
              const canDeleteMessage = isMine && !message.isDeleted && message.type !== 'SYSTEM';
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
              const imageUrl =
                !message.isDeleted && message.type === 'IMAGE'
                  ? resolveChatAssetUrl(message.s3Key)
                  : null;
              const fileUrl =
                !message.isDeleted && (message.type === 'FILE' || message.type === 'PDF')
                  ? resolveChatAssetUrl(message.s3Key ?? message.content)
                  : null;

              return (
                <div key={message.messageId}>
                  {shouldShowDateSeparator ? (
                    <div className="-mx-4 my-2 flex justify-center px-4 py-1">
                      <span className="rounded-full border border-neutral-200 bg-white/95 px-3 py-1 text-[11px] font-medium text-neutral-600">
                        {formatStickyDateLabel(message.createdAt)}
                      </span>
                    </div>
                  ) : null}

                  {shouldShowLastReadDivider ? (
                    <div ref={unreadDividerRef} className="my-3 flex items-center gap-2">
                      <span aria-hidden="true" className="h-px flex-1 bg-neutral-200" />
                      <span className="text-[11px] font-medium text-neutral-500">
                        여기까지 읽었습니다
                      </span>
                      <span aria-hidden="true" className="h-px flex-1 bg-neutral-200" />
                    </div>
                  ) : null}

                  <div
                    className={clsx(
                      'flex',
                      shouldShowDateSeparator ? 'mt-3' : 'mt-2',
                      isMine ? 'justify-end' : 'justify-start',
                    )}
                  >
                    <div
                      className={clsx(
                        isAccessibilityOn ? 'max-w-full min-w-0' : 'max-w-[78%] min-w-0',
                        message.type === 'SYSTEM' ? 'max-w-full' : '',
                      )}
                    >
                      {!isMine &&
                      !isPrivateRoom &&
                      message.type !== 'SYSTEM' &&
                      message.sender?.nickname ? (
                        <p className="mb-1 px-1 text-[11px] text-neutral-500">
                          {message.sender.nickname}
                        </p>
                      ) : null}

                      <div
                        className={clsx(
                          'flex items-start gap-2',
                          isMine ? 'justify-end' : 'justify-start',
                        )}
                      >
                        {isMine ? (
                          canDeleteMessage ? (
                            <button
                              type="button"
                              onClick={() => setDeleteTargetMessageId(message.messageId)}
                              className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 transition hover:bg-neutral-50 hover:text-red-500"
                              aria-label="메시지 삭제"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          ) : null
                        ) : null}
                        {shouldShowCounterpartAvatar ? (
                          message.sender?.profileImage ? (
                            <Image
                              src={message.sender.profileImage}
                              alt={`${message.sender.nickname ?? '상대방'} 프로필`}
                              width={32}
                              height={32}
                              className="mt-1 h-8 w-8 shrink-0 rounded-full border border-neutral-200 object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-neutral-100 text-xs font-semibold text-neutral-600">
                              {(message.sender?.nickname ?? '?').slice(0, 1)}
                            </div>
                          )
                        ) : null}
                        <div
                          className={clsx(
                            'flex min-w-0 flex-col',
                            isMine ? 'items-end' : 'items-start',
                          )}
                        >
                          {message.type === 'SYSTEM' ? (
                            <div className="mx-auto rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-center text-[11px] text-neutral-600">
                              {message.isDeleted ? '삭제된 시스템 메시지입니다.' : displayedContent}
                            </div>
                          ) : message.type === 'IMAGE' && !message.isDeleted ? (
                            <button
                              type="button"
                              onClick={() => {
                                if (!imageUrl) {
                                  toast('이미지를 불러올 수 없습니다.');
                                  return;
                                }
                                openImagePreview({
                                  src: imageUrl,
                                  alt: `${message.sender?.nickname ?? '채팅'} 이미지`,
                                });
                              }}
                              className={clsx(
                                'block overflow-hidden rounded-2xl border bg-white',
                                isMine ? 'border-[#05C075] bg-[#05C075]/5' : 'border-[#05C075]',
                              )}
                            >
                              {imageUrl ? (
                                <Image
                                  src={imageUrl}
                                  alt={`${message.sender?.nickname ?? '채팅'} 이미지`}
                                  width={240}
                                  height={240}
                                  className="max-h-[220px] w-auto max-w-[220px] object-cover"
                                  unoptimized
                                />
                              ) : (
                                <div className="flex h-[140px] w-[180px] items-center justify-center bg-neutral-100 text-xs font-medium text-neutral-500">
                                  이미지를 불러올 수 없습니다
                                </div>
                              )}
                            </button>
                          ) : (message.type === 'FILE' || message.type === 'PDF') &&
                            !message.isDeleted ? (
                            <button
                              type="button"
                              onClick={() => {
                                if (!fileUrl) {
                                  toast('파일을 열 수 없습니다.');
                                  return;
                                }
                                window.open(fileUrl, '_blank', 'noopener,noreferrer');
                              }}
                              className={clsx(
                                'flex min-w-[180px] items-center gap-2 rounded-2xl border px-3 py-2 text-left',
                                isMine
                                  ? 'border-[#05C075] bg-[#05C075] text-white'
                                  : 'border-[#05C075] bg-white text-neutral-900',
                              )}
                            >
                              <span
                                className={clsx(
                                  'inline-flex h-8 w-8 items-center justify-center rounded-full',
                                  isMine ? 'bg-white/15' : 'bg-[#05C075]/10',
                                )}
                              >
                                <FileText
                                  className={clsx(
                                    'h-4 w-4',
                                    isMine ? 'text-white' : 'text-[#05C075]',
                                  )}
                                />
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold">PDF 파일</p>
                                <p
                                  className={clsx(
                                    'mt-0.5 text-[11px]',
                                    isMine ? 'text-white/80' : 'text-neutral-500',
                                  )}
                                >
                                  탭하여 열기
                                </p>
                              </div>
                            </button>
                          ) : (
                            <div
                              className={clsx(
                                'max-w-full rounded-2xl border px-3 py-2',
                                message.isDeleted
                                  ? 'border-neutral-200 bg-neutral-100'
                                  : isMine
                                    ? 'border-[#05C075] bg-[#05C075] text-white'
                                    : 'border-[#05C075] bg-white text-neutral-900',
                              )}
                              onMouseDown={
                                canDeleteMessage
                                  ? () => startDeleteLongPress(message.messageId)
                                  : undefined
                              }
                              onMouseUp={canDeleteMessage ? clearDeleteLongPressTimer : undefined}
                              onMouseLeave={
                                canDeleteMessage ? clearDeleteLongPressTimer : undefined
                              }
                              onTouchStart={
                                canDeleteMessage
                                  ? () => startDeleteLongPress(message.messageId)
                                  : undefined
                              }
                              onTouchEnd={canDeleteMessage ? clearDeleteLongPressTimer : undefined}
                              onTouchCancel={
                                canDeleteMessage ? clearDeleteLongPressTimer : undefined
                              }
                              onContextMenu={
                                canDeleteMessage
                                  ? (event) => {
                                      event.preventDefault();
                                    }
                                  : undefined
                              }
                            >
                              <p
                                className={clsx(
                                  'text-sm [overflow-wrap:anywhere] break-words whitespace-pre-wrap',
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
                                    isMine ? 'text-white/80' : 'text-neutral-500',
                                  )}
                                >
                                  {isExpanded ? '접기' : '더보기'}
                                </button>
                              ) : null}
                            </div>
                          )}

                          {message.type !== 'SYSTEM' ? (
                            <span className="mt-1 px-1 text-[11px] text-neutral-400">
                              {formatMessageTime(message.createdAt)}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </section>

      <div className="border-t border-neutral-200 bg-white px-3 pt-2 pb-5">
        <form
          onSubmit={handleSendMessage}
          className={clsx(
            isAccessibilityOn ? 'flex flex-col items-stretch gap-3' : 'flex items-end gap-2',
          )}
        >
          <input
            ref={imageAttachmentInputRef}
            type="file"
            className="hidden"
            multiple
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={(event) => {
              void handleAttachmentChange(event);
            }}
          />
          <input
            ref={fileAttachmentInputRef}
            type="file"
            className="hidden"
            accept="application/pdf"
            onChange={(event) => {
              void handleAttachmentChange(event);
            }}
          />
          <button
            ref={attachmentTriggerRef}
            type="button"
            onClick={handleAttachmentTriggerClick}
            disabled={isAttachmentUploading}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-neutral-200 bg-white text-neutral-700 shadow-sm transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:text-neutral-300"
            aria-label="채팅 첨부 열기"
          >
            {isAttachmentUploading ? (
              <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin" />
            ) : (
              <Paperclip aria-hidden="true" className="h-5 w-5" />
            )}
          </button>

          <div className="flex-1">
            <textarea
              value={messageInput}
              onChange={(event) => setMessageInput(event.target.value.slice(0, 2000))}
              placeholder="메시지를 입력하세요"
              className="h-11 w-full resize-none rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-base font-medium text-neutral-900 transition outline-none placeholder:text-neutral-400 focus:border-[#05C075] focus:ring-2 focus:ring-[#05C075]/20"
              maxLength={2000}
              rows={1}
              onCompositionStart={() => {
                isMessageInputComposingRef.current = true;
              }}
              onCompositionEnd={() => {
                isMessageInputComposingRef.current = false;
              }}
              onKeyDown={(event) => {
                const isComposing =
                  isMessageInputComposingRef.current ||
                  (event.nativeEvent as KeyboardEvent).isComposing;
                if (isComposing) {
                  return;
                }

                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  if (!messageInput.trim() || isAttachmentUploading) {
                    return;
                  }
                  void handleSendMessage();
                }
              }}
            />
          </div>

          <div className="relative h-11 w-11 shrink-0">
            <button
              type="submit"
              disabled={!messageInput.trim() || isAttachmentUploading}
              className={clsx(
                'inline-flex h-11 w-11 items-center justify-center rounded-2xl transition',
                !messageInput.trim() || isAttachmentUploading
                  ? 'bg-neutral-200 text-neutral-500'
                  : 'bg-[#05C075] text-white hover:bg-[#049e61]',
              )}
              aria-label="메시지 전송"
            >
              <SendHorizonal className="h-5 w-5" />
            </button>
            <div
              className={clsx(
                'text-center text-[11px] text-neutral-400',
                isAccessibilityOn ? 'mt-1' : 'absolute top-full left-1/2 mt-1 -translate-x-1/2',
              )}
            >
              {messageInput.length}/2000
            </div>
          </div>
        </form>
      </div>

      {imagePreview ? (
        <div
          ref={imagePreviewDialogRef}
          className="fixed inset-0 z-[220] flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="이미지 미리보기"
          tabIndex={-1}
        >
          <button
            type="button"
            aria-label="이미지 미리보기 닫기"
            onClick={closeImagePreview}
            className="absolute inset-0"
          />
          <div className="relative z-10 flex max-h-full max-w-full items-center justify-center">
            <Image
              src={imagePreview.src}
              alt={imagePreview.alt}
              width={1280}
              height={1280}
              className="max-h-[85vh] w-auto max-w-[92vw] rounded-xl object-contain"
              unoptimized
            />
            <button
              type="button"
              onClick={closeImagePreview}
              className="absolute top-2 right-2 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white"
            >
              닫기
            </button>
          </div>
        </div>
      ) : null}

      {isAttachmentPickerOpen ? (
        <div className="fixed inset-0 z-[175] flex items-end justify-center">
          <button
            type="button"
            aria-label="첨부 선택 닫기"
            onClick={closeAttachmentPicker}
            className="absolute inset-0 bg-black/45"
          />
          <section
            ref={attachmentPickerDialogRef}
            className="relative z-10 w-full max-w-[430px] rounded-t-2xl bg-white p-4 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="chat-attachment-picker-title"
            tabIndex={-1}
          >
            <h2
              id="chat-attachment-picker-title"
              className="text-base font-semibold text-neutral-900"
            >
              파일/이미지 첨부
            </h2>
            <p className="mt-1 text-xs text-neutral-500">
              이미지 최대 9장(5MB 이하, JPG/JPEG/PNG/WEBP), 파일 1개(PDF, 5MB 이하)
            </p>

            <div
              className={clsx(
                'mt-4 gap-2',
                isAccessibilityOn ? 'grid grid-cols-1' : 'grid grid-cols-2',
              )}
            >
              <button
                type="button"
                onClick={handlePickImageAttachments}
                disabled={isAttachmentUploading}
                className="flex items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-3 text-sm font-semibold text-neutral-800 hover:bg-neutral-50 disabled:opacity-60"
              >
                <FileImage aria-hidden="true" className="h-4 w-4" />
                이미지 첨부
              </button>
              <button
                type="button"
                onClick={handlePickFileAttachment}
                disabled={isAttachmentUploading}
                className="flex items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-3 text-sm font-semibold text-neutral-800 hover:bg-neutral-50 disabled:opacity-60"
              >
                <FileText aria-hidden="true" className="h-4 w-4" />
                파일 첨부
              </button>
            </div>

            <button
              type="button"
              onClick={closeAttachmentPicker}
              className="mt-3 w-full rounded-lg bg-neutral-900 px-3 py-2.5 text-sm font-semibold text-white"
            >
              닫기
            </button>
          </section>
        </div>
      ) : null}

      {attachmentValidationMessage ? (
        <div
          className="fixed inset-0 z-[205] flex items-center justify-center px-4"
          {...(isAccessibilityOn
            ? {
                role: 'dialog',
                'aria-modal': true,
                'aria-labelledby': 'attachment-validation-modal-title',
              }
            : {})}
        >
          <button
            type="button"
            aria-label="유효성 검사 안내 닫기"
            onClick={() => setAttachmentValidationMessage(null)}
            className="absolute inset-0 bg-black/50"
          />
          <section className="relative z-10 w-full max-w-[360px] rounded-2xl bg-white p-5 shadow-2xl">
            <h3
              id={isAccessibilityOn ? 'attachment-validation-modal-title' : undefined}
              className="text-base font-semibold text-neutral-900"
            >
              유효성 검사 실패
            </h3>
            <p className="mt-2 text-sm leading-6 text-neutral-600">{attachmentValidationMessage}</p>
            <button
              type="button"
              onClick={() => setAttachmentValidationMessage(null)}
              className="mt-5 w-full rounded-full bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white"
            >
              확인
            </button>
          </section>
        </div>
      ) : null}

      {isSettingsPage ? (
        <div
          ref={settingsDialogRef}
          className="fixed top-14 bottom-0 left-1/2 z-40 w-full max-w-[430px] -translate-x-1/2 overflow-hidden bg-white"
          role="dialog"
          aria-modal="true"
          aria-label="채팅방 설정"
          tabIndex={-1}
        >
          <section className="mx-auto flex h-full w-full max-w-[430px] flex-col bg-white">
            <div className="flex-1 overflow-y-auto">
              <div className="mx-auto w-full max-w-[392px] px-5 pt-4 pb-6">
                <div className="divide-y divide-neutral-200">
                  <section className="py-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-neutral-900">알림 설정</p>
                      <div className="flex items-center gap-2">
                        {isAccessibilityOn ? (
                          <span className="text-xs font-medium text-neutral-600" aria-live="polite">
                            {isAlarmOnInput ? '켜짐' : '꺼짐'}
                          </span>
                        ) : null}
                        <button
                          type="button"
                          role="switch"
                          aria-checked={isAlarmOnInput}
                          onClick={() => setIsAlarmOnInput((prev) => !prev)}
                          className={clsx(
                            'relative inline-flex h-7 w-12 items-center rounded-full transition',
                            isAlarmOnInput ? 'bg-[#05C075]' : 'bg-neutral-300',
                          )}
                          aria-label={`알림 ${isAlarmOnInput ? '켜짐' : '꺼짐'}`}
                        >
                          <span
                            className={clsx(
                              'inline-block h-5 w-5 rounded-full bg-white transition',
                              isAlarmOnInput ? 'translate-x-6' : 'translate-x-1',
                            )}
                          />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4">
                      <label
                        htmlFor="chat-room-name-input"
                        className="mb-2 block text-sm font-semibold text-neutral-900"
                      >
                        채팅방 이름
                      </label>
                      <input
                        id="chat-room-name-input"
                        value={roomNameInput}
                        onChange={(event) => setRoomNameInput(event.target.value)}
                        disabled={isPrivateRoom}
                        placeholder={
                          isPrivateRoom
                            ? '1:1 채팅방은 이름 수정이 불가합니다.'
                            : '채팅방 이름을 입력하세요'
                        }
                        className="h-10 w-full rounded-lg border border-neutral-200 px-3 text-base text-neutral-900 placeholder:text-neutral-400 disabled:bg-neutral-100 disabled:text-neutral-400"
                      />
                    </div>
                  </section>
                </div>
              </div>
            </div>

            <div className="shrink-0 border-t border-neutral-200 bg-white px-5 pt-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] shadow-[0_-6px_16px_rgba(15,23,42,0.04)]">
              <div className="mx-auto w-full max-w-[392px]">
                <div
                  className={clsx(
                    'gap-2',
                    isAccessibilityOn ? 'grid grid-cols-1' : 'grid grid-cols-2',
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setIsLeaveConfirmOpen(true)}
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100"
                  >
                    채팅방 나가기
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      void handleSaveRoomSettings();
                    }}
                    disabled={putRoomSettingsMutation.isPending}
                    className="rounded-lg bg-[#05C075] px-3 py-2.5 text-sm font-semibold text-white hover:bg-[#049e61] disabled:opacity-60"
                  >
                    {putRoomSettingsMutation.isPending ? '저장 중...' : '저장'}
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      ) : null}

      <ConfirmModal
        isOpen={deleteTargetMessageId !== null}
        title="메시지를 삭제하시겠어요?"
        message="삭제된 메시지는 복구할 수 없습니다."
        confirmText={deleteMessageMutation.isPending ? '삭제 중...' : '삭제'}
        cancelText="취소"
        onConfirm={() => {
          void handleDeleteMessage();
        }}
        onCancel={() => {
          if (deleteMessageMutation.isPending) {
            return;
          }
          setDeleteTargetMessageId(null);
        }}
      />

      <ConfirmModal
        isOpen={isLeaveConfirmOpen}
        title="채팅방에서 나가시겠어요?"
        message="나가면 이 채팅방의 메시지를 더 이상 확인할 수 없습니다."
        confirmText={leaveChatRoomMutation.isPending ? '나가는 중...' : '나가기'}
        cancelText="취소"
        onConfirm={() => {
          void handleLeaveChatRoom();
        }}
        onCancel={() => {
          if (leaveChatRoomMutation.isPending) {
            return;
          }
          setIsLeaveConfirmOpen(false);
        }}
      />
    </main>
  );
}
