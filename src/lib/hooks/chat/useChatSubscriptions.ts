'use client';

import { useCallback, useEffect } from 'react';

import { chatStompManager } from '@/lib/chat/stompManager';

import type { IMessage } from '@stomp/stompjs';

type UseChatSubscriptionsParams = Readonly<{
  enabled?: boolean;
  roomId: number | null;
  userId: number | null;
  onRoomMessage?: (message: IMessage) => void;
  onUserNotification?: (message: IMessage) => void;
}>;

export function useChatSubscriptions({
  enabled = true,
  roomId,
  userId,
  onRoomMessage,
  onUserNotification,
}: UseChatSubscriptionsParams) {
  const handleRoomMessage = useCallback(
    (message: IMessage) => {
      onRoomMessage?.(message);
    },
    [onRoomMessage],
  );

  const handleUserNotification = useCallback(
    (message: IMessage) => {
      onUserNotification?.(message);
    },
    [onUserNotification],
  );

  useEffect(() => {
    if (!enabled || roomId === null) {
      return;
    }

    const destination = `/topic/chatroom/${roomId}`;
    return chatStompManager.subscribe(destination, handleRoomMessage);
  }, [enabled, handleRoomMessage, roomId]);

  useEffect(() => {
    if (!enabled || userId === null) {
      return;
    }

    const destination = `/topic/user/${userId}/notifications`;
    return chatStompManager.subscribe(destination, handleUserNotification);
  }, [enabled, handleUserNotification, userId]);
}
