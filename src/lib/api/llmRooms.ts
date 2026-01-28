import { api, refreshAccessToken, type ApiClientResult } from '@/lib/api/client';
import { getAccessToken } from '@/lib/auth/token';

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
  SSEErrorEvent,
  StartAnalysisRequest,
  StartAnalysisResponse,
  StartInterviewRequest,
  StartInterviewResponse,
  TaskResultData,
} from '@/types/llm';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export type StreamMessageCallbacks = {
  onChunk?: (chunk: string, accumulated: string) => void;
  onDone?: (fullText: string) => void;
  onError?: (error: SSEErrorEvent | Error) => void;
};

async function fetchWithAuth(
  url: string,
  body: SendMessageRequest,
  isRetry = false,
): Promise<Response> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'text/event-stream',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    credentials: 'include',
    body: JSON.stringify(body),
  });

  if (response.status === 401 && !isRetry) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return fetchWithAuth(url, body, true);
    }
  }

  return response;
}

export async function streamMessage(
  roomId: number,
  body: SendMessageRequest,
  callbacks: StreamMessageCallbacks,
): Promise<void> {
  const path = `/api/ai-chatrooms/${roomId}/messages`;
  const url = new URL(path, BASE_URL).toString();

  const response = await fetchWithAuth(url, body);

  if (!response.ok) {
    const errorText = await response.text();
    callbacks.onError?.(new Error(`HTTP ${response.status}: ${errorText}`));
    return;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    callbacks.onError?.(new Error('No response body'));
    return;
  }

  const decoder = new TextDecoder();
  let accumulated = '';
  let buffer = '';
  let currentEvent = '';

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        callbacks.onDone?.(accumulated);
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (line.startsWith('event: ')) {
          currentEvent = line.slice(7).trim();
          continue;
        }

        if (line.startsWith('data: ')) {
          const data = line.slice(6);

          if (currentEvent === 'done') {
            callbacks.onDone?.(accumulated);
            currentEvent = '';
            continue;
          }

          if (currentEvent === 'error') {
            try {
              const parsed = JSON.parse(data) as SSEErrorEvent;
              callbacks.onError?.(parsed);
            } catch {
              callbacks.onError?.(new Error(data || 'Unknown error'));
            }
            currentEvent = '';
            continue;
          }

          if (data) {
            accumulated += data;
            callbacks.onChunk?.(data, accumulated);
          }

          currentEvent = '';
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

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
  const path = `/api/ai-chatrooms/${roomId}/analysis`;

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
  const path = `/api/ai-chatrooms/${roomId}/interview`;

  return api.post<StartInterviewResponse>(path, body);
}

export async function endInterview(
  roomId: number,
  body: EndInterviewRequest,
): Promise<ApiClientResult<EndInterviewResponse>> {
  const path = `/api/ai-chatrooms/${roomId}/evaluation`;

  return api.post<EndInterviewResponse>(path, body);
}
