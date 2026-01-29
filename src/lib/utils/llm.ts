import { getRoomStorageMode } from '@/lib/storage/aiChatroomStorage';

import type { LlmRoom } from '@/components/llm/rooms/types';
import type { AiChatRoom, ChatMessage } from '@/types/llm';

export type MessageStatus = 'sending' | 'sent' | 'failed';

export type UIAttachment = {
  type: 'image' | 'file';
  name: string;
  url?: string;
};

export type UIMessage = {
  id: string;
  role: 'USER' | 'AI' | 'SYSTEM';
  text: string;
  time?: string;
  attachments?: UIAttachment[];
  status?: MessageStatus;
};

export function formatUpdatedAt(isoString: string): string {
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

export function mapAiChatRoomToLlmRoom(room: AiChatRoom): LlmRoom {
  return {
    id: room.roomUuid,
    numericId: room.roomId,
    title: room.title,
    updatedAt: formatUpdatedAt(room.updatedAt),
    storage: getRoomStorageMode(room.roomUuid),
  };
}

const S3_BASE_URL = process.env.NEXT_PUBLIC_S3_URL ?? '';

function mapRole(role: ChatMessage['role']): UIMessage['role'] {
  switch (role) {
    case 'ASSISTANT':
      return 'AI';
    case 'SYSTEM':
      return 'SYSTEM';
    default:
      return 'USER';
  }
}

export function toUIMessage(msg: ChatMessage): UIMessage {
  const attachments: UIAttachment[] | undefined = msg.attachments?.map((att) => ({
    type: att.mimeType.startsWith('image/') ? 'image' : 'file',
    name: att.originalName,
    url: `${S3_BASE_URL}/${att.s3Key}`,
  }));

  return {
    id: String(msg.messageId),
    role: mapRole(msg.role),
    text: msg.content,
    time: formatMessageTime(msg.createdAt),
    attachments: attachments?.length ? attachments : undefined,
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
