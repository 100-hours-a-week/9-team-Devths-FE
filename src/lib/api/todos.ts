import { api, apiRequest, type ApiClientResult } from '@/lib/api/client';

import type { ApiResponse } from '@/types/api';
import type {
  Todo,
  TodoCreateRequest,
  TodoCreateResponse,
  TodoStatusUpdateRequest,
  TodoStatusUpdateResponse,
  TodoUpdateRequest,
} from '@/types/todo';

type ApiEnvelope<T> = ApiResponse<T | null>;

export type TodoApiResult<T> = {
  ok: boolean;
  status: number;
  data: T | null;
  message: string | null;
  timestamp: string | null;
  json: ApiEnvelope<T> | null;
  res: Response;
};

function unwrapApiResult<T>(result: ApiClientResult<T>): TodoApiResult<T> {
  const json = result.json as ApiEnvelope<T> | null;

  return {
    ok: result.ok,
    status: result.status,
    data: json?.data ?? null,
    message: json?.message ?? null,
    timestamp: json?.timestamp ?? null,
    json,
    res: result.res,
  };
}

export async function listTodos(dueDate?: string): Promise<TodoApiResult<Todo[]>> {
  const queryParams = new URLSearchParams();

  if (dueDate) {
    queryParams.set('dueDate', dueDate);
  }

  const path = queryParams.toString() ? `/api/todos?${queryParams.toString()}` : '/api/todos';

  const result = await api.get<Todo[]>(path, { credentials: 'include' });

  return unwrapApiResult(result);
}

export async function createTodo(
  body: TodoCreateRequest,
): Promise<TodoApiResult<TodoCreateResponse>> {
  const result = await api.post<TodoCreateResponse>('/api/todos', body, {
    credentials: 'include',
  });

  return unwrapApiResult(result);
}

export async function updateTodo(
  todoId: string,
  body: TodoUpdateRequest,
): Promise<TodoApiResult<TodoCreateResponse>> {
  const encodedTodoId = encodeURIComponent(todoId);

  const result = await apiRequest<TodoCreateResponse>({
    method: 'PATCH',
    path: `/api/todos/${encodedTodoId}`,
    body,
    credentials: 'include',
  });

  return unwrapApiResult(result);
}

export async function updateTodoStatus(
  todoId: string,
  body: TodoStatusUpdateRequest,
): Promise<TodoApiResult<TodoStatusUpdateResponse>> {
  const encodedTodoId = encodeURIComponent(todoId);

  const result = await apiRequest<TodoStatusUpdateResponse>({
    method: 'PATCH',
    path: `/api/todos/${encodedTodoId}/status`,
    body,
    credentials: 'include',
  });

  return unwrapApiResult(result);
}

export async function deleteTodo(todoId: string): Promise<TodoApiResult<null>> {
  const encodedTodoId = encodeURIComponent(todoId);

  const result = await api.delete<null>(`/api/todos/${encodedTodoId}`, {
    credentials: 'include',
  });

  if (result.status === 204) {
    return unwrapApiResult({ ...result, json: null });
  }

  return unwrapApiResult(result);
}
