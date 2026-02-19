import { api, type ApiClientResult } from '@/lib/api/client';

import type { ChatRoomType, ChatroomsCursor } from '@/types/chat';

type ChatRoomSummaryResponse = Readonly<{
  roomId: number;
  title: string;
  lastMessageContent: string | null;
  lastMessageAt: string | null;
  currentCount: number;
  tag: string | null;
}>;

export type ChatRoomListResponse = Readonly<{
  chatRooms: ReadonlyArray<ChatRoomSummaryResponse>;
  cursor: ChatroomsCursor | null;
  hasNext: boolean;
}>;

export type FetchChatRoomsParams = Readonly<{
  type?: ChatRoomType | null;
  size?: number | null;
  // 서버 응답 cursor를 그대로 재사용합니다.
  cursor?: ChatroomsCursor | null;
}>;

export type PrivateChatRoomCreateRequest = Readonly<{
  userId: number;
}>;

export type PrivateChatRoomCreateResponse = Readonly<{
  roomId: number;
  isNew: boolean;
  type: ChatRoomType;
  title: string | null;
  inviteCode: string | null;
  createdAt: string;
}>;

export async function fetchChatRooms(
  params?: FetchChatRoomsParams,
): Promise<ApiClientResult<ChatRoomListResponse>> {
  const queryParams = new URLSearchParams();

  const type = params?.type;
  if (type) {
    queryParams.set('type', type);
  }

  const size = params?.size;
  if (size !== null && size !== undefined) {
    queryParams.set('size', String(size));
  }

  const cursor = params?.cursor;
  if (cursor) {
    queryParams.set('cursor', cursor);
  }

  const queryString = queryParams.toString();
  const path = queryString ? `/api/chatrooms?${queryString}` : '/api/chatrooms';

  return api.get<ChatRoomListResponse>(path);
}

export async function createPrivateChatRoom(
  body: PrivateChatRoomCreateRequest,
): Promise<ApiClientResult<PrivateChatRoomCreateResponse>> {
  return api.post<PrivateChatRoomCreateResponse>('/api/chatrooms/private', body);
}
