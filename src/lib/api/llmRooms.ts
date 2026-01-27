import { api, type ApiClientResult } from '@/lib/api/client';

import type {
  CreateRoomResponse,
  EndInterviewRequest,
  EndInterviewResponse,
  FetchMessagesParams,
  FetchMessagesResponse,
  FetchRoomsParams,
  FetchRoomsResponse,
  SendMessageRequest,
  SendMessageResponse,
  StartAnalysisRequest,
  StartAnalysisResponse,
  StartInterviewRequest,
  StartInterviewResponse,
  TaskResultData,
} from '@/types/llm';

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

export async function createRoom(): Promise<ApiClientResult<CreateRoomResponse>> {
  return api.post<CreateRoomResponse>('/api/ai-chatrooms');
}

export async function deleteRoom(roomId: number): Promise<ApiClientResult<void>> {
  const path = `/api/ai-chatrooms/${roomId}`;

  return api.delete<void>(path);
}

export async function archiveRoom(roomId: number): Promise<ApiClientResult<void>> {
  const path = `/api/ai-chatrooms/${roomId}/archive`;

  return api.post<void>(path);
}

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

export async function sendMessage(
  roomId: number,
  body: SendMessageRequest,
): Promise<ApiClientResult<SendMessageResponse>> {
  const path = `/api/ai-chatrooms/${roomId}/messages`;

  return api.post<SendMessageResponse>(path, body);
}

export async function startAnalysis(
  roomId: number,
  body: StartAnalysisRequest,
): Promise<ApiClientResult<StartAnalysisResponse>> {
  const path = `/api/ai/chatrooms/${roomId}/analysis`;

  return api.post<StartAnalysisResponse>(path, body);
}

export async function getTaskStatus(taskId: number): Promise<ApiClientResult<TaskResultData>> {
  const path = `/api/ai/tasks/${taskId}`;

  return api.get<TaskResultData>(path);
}

export async function startInterview(
  roomId: number,
  body: StartInterviewRequest,
): Promise<ApiClientResult<StartInterviewResponse>> {
  const path = `/api/ai/chatrooms/${roomId}/interview`;

  return api.post<StartInterviewResponse>(path, body);
}

export async function endInterview(
  roomId: number,
  body: EndInterviewRequest,
): Promise<ApiClientResult<EndInterviewResponse>> {
  const path = `/api/ai/chatrooms/${roomId}/evaluation`;

  return api.post<EndInterviewResponse>(path, body);
}
