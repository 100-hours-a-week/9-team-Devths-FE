import { api, type ApiClientResult } from '@/lib/api/client';

import type {
  CreateRoomResponse,
  FetchMessagesParams,
  FetchMessagesResponse,
  FetchRoomsParams,
  FetchRoomsResponse,
  SendMessageRequest,
  SendMessageResponse,
} from '@/types/llm';

// GET /api/ai-chatrooms?size=n&lastId=k
export async function fetchRooms(
  params?: FetchRoomsParams,
): Promise<ApiClientResult<FetchRoomsResponse>> {
  const { size = 10, lastId } = params ?? {};

  const queryParams = new URLSearchParams();
  queryParams.set('size', size.toString());
  if (lastId !== undefined) {
    queryParams.set('lastId', lastId.toString());
  }

  const path = `/api/ai-chatrooms?${queryParams.toString()}`;

  return api.get<FetchRoomsResponse>(path);
}

// POST /api/ai-chatrooms
export async function createRoom(): Promise<ApiClientResult<CreateRoomResponse>> {
  return api.post<CreateRoomResponse>('/api/ai-chatrooms');
}

// DELETE /api/ai-chatrooms/{roomId}
export async function deleteRoom(roomId: number): Promise<ApiClientResult<void>> {
  const path = `/api/ai-chatrooms/${roomId}`;

  return api.delete<void>(path);
}

// AI 채팅방 보관 (임시→보관 전환)
// 아직 서버 API 미구현
export async function archiveRoom(roomId: number): Promise<ApiClientResult<void>> {
  const path = `/api/ai-chatrooms/${roomId}/archive`;

  return api.post<void>(path);
}

// GET /api/ai-chatrooms/{roomId}/messages?size=n&lastId=k
export async function fetchMessages(
  roomId: number,
  params?: FetchMessagesParams,
): Promise<ApiClientResult<FetchMessagesResponse>> {
  const { size = 10, lastId } = params ?? {};

  const queryParams = new URLSearchParams();
  queryParams.set('size', size.toString());
  if (lastId !== undefined) {
    queryParams.set('lastId', lastId.toString());
  }

  const path = `/api/ai-chatrooms/${roomId}/messages?${queryParams.toString()}`;

  return api.get<FetchMessagesResponse>(path);
}

// POST /api/ai-chatrooms/{roomId}/messages
export async function sendMessage(
  roomId: number,
  body: SendMessageRequest,
): Promise<ApiClientResult<SendMessageResponse>> {
  const path = `/api/ai-chatrooms/${roomId}/messages`;

  return api.post<SendMessageResponse>(path, body);
}
