import { getRoomStorageMode } from '@/lib/storage/aiChatroomStorage';

import type { LlmRoom } from '@/components/llm/rooms/types';
import type { AiChatRoom, ChatMessage } from '@/types/llm';

export type MessageStatus = 'sending' | 'sent' | 'failed';

export type UIMessage = {
  id: string;
  role: 'USER' | 'AI' | 'SYSTEM';
  text: string;
  time?: string;
  attachments?: Array<{ type: 'image' | 'file'; name: string }>;
  status?: MessageStatus;
};

export function mapAiChatRoomToLlmRoom(room: AiChatRoom): LlmRoom {
  return {
    id: room.roomUuid,
    title: room.title,
    updatedAt: formatUpdatedAt(room.updatedAt),
    storage: getRoomStorageMode(room.roomUuid),
  };
}

function formatUpdatedAt(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) {
    return `${diffMins}분 전`;
  }

  if (diffHours < 24) {
    const hour = date.getHours();
    const period = hour < 12 ? '오전' : '오후';
    const displayHour = hour % 12 || 12;
    return `${period} ${displayHour}:${String(date.getMinutes()).padStart(2, '0')}`;
  }

  if (diffDays === 1) {
    return '어제';
  }

  if (date.getFullYear() === now.getFullYear()) {
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }

  return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
}

export function toUIMessage(msg: ChatMessage): UIMessage {
  return {
    id: String(msg.messageId),
    role: msg.role === 'ASSISTANT' ? 'AI' : 'USER',
    text: msg.content,
    time: formatMessageTime(msg.createdAt),
  };
}

function formatMessageTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('ko-KR', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}
