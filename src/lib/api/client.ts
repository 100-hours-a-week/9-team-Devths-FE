import axios from 'axios';

import {
  clearAccessToken,
  getAccessToken,
  isAccessTokenExpired,
  setAccessToken,
} from '@/lib/auth/token';

import type { ApiErrorResponse, ApiResponse } from '@/types/api';
import type { InternalAxiosRequestConfig } from 'axios';

// 토큰 갱신 성공 시 발행하는 전역 이벤트 (STOMP 재연결 트리거 등에 활용)
export const ACCESS_TOKEN_REFRESHED_EVENT = 'access-token-refreshed';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  if (!BASE_URL) return false;

  try {
    const res = await fetch(new URL('/api/auth/tokens', BASE_URL).toString(), {
      method: 'POST',
      credentials: 'include',
    });

    if (!res.ok) {
      clearAccessToken();
      return false;
    }

    const authHeader = res.headers.get('authorization');
    const newToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (newToken) {
      setAccessToken(newToken);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(ACCESS_TOKEN_REFRESHED_EVENT));
      }
      return true;
    }

    return false;
  } catch {
    clearAccessToken();
    return false;
  }
}

export async function ensureAccessToken(): Promise<boolean> {
  const token = getAccessToken();
  if (token && !isAccessTokenExpired(token)) {
    return true;
  }

  if (!isRefreshing) {
    isRefreshing = true;
    refreshPromise = refreshAccessToken().finally(() => {
      isRefreshing = false;
      refreshPromise = null;
    });
  }

  return refreshPromise ?? false;
}

export function buildApiUrl(path: string) {
  if (!BASE_URL) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL is not set in .env.local');
  }
  return new URL(path, BASE_URL).toString();
}

// ---------------------------------------------------------------------------
// Axios 인스턴스
// ---------------------------------------------------------------------------

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// 요청 인터셉터: Authorization 헤더 주입
axiosInstance.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  if (config.headers?.['X-Skip-Auth']) {
    delete config.headers['X-Skip-Auth'];
    return config;
  }

  await ensureAccessToken();
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// 응답 인터셉터: 401 → 토큰 갱신 → 재시도
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error);
    }

    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = refreshAccessToken().finally(() => {
          isRefreshing = false;
          refreshPromise = null;
        });
      }

      const refreshed = await (refreshPromise ?? Promise.resolve(false));

      if (refreshed) {
        const token = getAccessToken();
        if (token) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        return axiosInstance(originalRequest);
      }
    }

    return Promise.reject(error);
  },
);

// ---------------------------------------------------------------------------
// 공통 반환 타입
// ---------------------------------------------------------------------------

export type ApiClientResult<T> = {
  ok: boolean;
  status: number;
  json: (ApiResponse<T> | ApiErrorResponse) | null;
  /** 응답 헤더 (소문자 정규화된 Axios 헤더) */
  headers: Record<string, string>;
};

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type RequestOptions = {
  method: HttpMethod;
  path: string;
  body?: unknown;
  withAuth?: boolean;
  headers?: Record<string, string>;
  /** Axios 인스턴스가 withCredentials: true 전역 설정이므로 무시됩니다. */
  credentials?: RequestCredentials;
};

export async function apiRequest<T>(options: RequestOptions): Promise<ApiClientResult<T>> {
  const { method, path, body, withAuth = true, headers = {} } = options;

  const config = {
    method,
    url: path,
    headers: { ...headers } as Record<string, string>,
    data: body,
  };

  if (!withAuth) {
    config.headers['X-Skip-Auth'] = '1';
  }

  try {
    const response = await axiosInstance(config);

    return {
      ok: true,
      status: response.status,
      json: response.status === 204 ? null : ((response.data ?? null) as ApiResponse<T> | null),
      headers: response.headers as Record<string, string>,
    };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return {
        ok: false,
        status: error.response.status,
        json: (error.response.data ?? null) as ApiErrorResponse | null,
        headers: error.response.headers as Record<string, string>,
      };
    }
    throw error;
  }
}

export const api = {
  get<T>(path: string, opts?: Omit<RequestOptions, 'method' | 'path'>) {
    return apiRequest<T>({ method: 'GET', path, ...opts });
  },
  post<T>(path: string, body?: unknown, opts?: Omit<RequestOptions, 'method' | 'path' | 'body'>) {
    return apiRequest<T>({ method: 'POST', path, body, ...opts });
  },
  put<T>(path: string, body?: unknown, opts?: Omit<RequestOptions, 'method' | 'path' | 'body'>) {
    return apiRequest<T>({ method: 'PUT', path, body, ...opts });
  },
  patch<T>(path: string, body?: unknown, opts?: Omit<RequestOptions, 'method' | 'path' | 'body'>) {
    return apiRequest<T>({ method: 'PATCH', path, body, ...opts });
  },
  delete<T>(path: string, opts?: Omit<RequestOptions, 'method' | 'path'>) {
    return apiRequest<T>({ method: 'DELETE', path, ...opts });
  },
};

// ---------------------------------------------------------------------------
// 스트리밍 전용 (fetch 유지 — Axios는 스트리밍 미지원)
// ---------------------------------------------------------------------------

type StreamRequestOptions = {
  method: HttpMethod;
  path: string;
  body?: unknown;
  withAuth?: boolean;
  headers?: Record<string, string>;
  accept?: string;
};

export async function apiStreamRequest(
  options: StreamRequestOptions,
  isRetry = false,
): Promise<Response> {
  const { method, path, body, withAuth = true, headers = {}, accept } = options;

  if (!BASE_URL) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL is not set in .env.local');
  }

  const url = new URL(path, BASE_URL).toString();
  const finalHeaders: Record<string, string> = { ...headers };

  if (accept) finalHeaders.Accept = accept;

  if (body !== undefined && body !== null) {
    finalHeaders['Content-Type'] = finalHeaders['Content-Type'] ?? 'application/json';
  }

  if (withAuth) {
    await ensureAccessToken();
    const token = getAccessToken();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method,
    headers: finalHeaders,
    credentials: 'include',
    body: body !== undefined && body !== null ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && withAuth && !isRetry) {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = refreshAccessToken().finally(() => {
        isRefreshing = false;
        refreshPromise = null;
      });
    }

    const refreshed = await (refreshPromise ?? Promise.resolve(false));
    if (refreshed) {
      return apiStreamRequest(options, true);
    }
  }

  return res;
}
