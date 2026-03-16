import { QueryClient } from '@tanstack/react-query';
import { cookies } from 'next/headers';

import { llmKeys } from '@/lib/hooks/llm/queryKeys';

import type { AiChatRoom } from '@/types/llm';
import type { CursorListResponse } from '@/types/pagination';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

async function getServerAccessToken(cookieHeader: string): Promise<string | null> {
  if (!BASE_URL) return null;
  try {
    const res = await fetch(new URL('/api/auth/tokens', BASE_URL).toString(), {
      method: 'POST',
      headers: { Cookie: cookieHeader },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const authHeader = res.headers.get('authorization');
    return authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  } catch {
    return null;
  }
}

type LlmRoomsPage = {
  rooms: AiChatRoom[];
  lastId: number | null;
  hasNext: boolean;
};

export async function prefetchLlmRooms(queryClient: QueryClient): Promise<void> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ');

  const token = await getServerAccessToken(cookieHeader);
  if (!token || !BASE_URL) return;

  await queryClient.prefetchInfiniteQuery({
    queryKey: llmKeys.rooms(),
    queryFn: async ({ pageParam }) => {
      const url = new URL('/api/ai-chatrooms', BASE_URL);
      url.searchParams.set('size', '10');
      if (pageParam !== undefined) {
        url.searchParams.set('lastId', String(pageParam));
      }

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      if (!res.ok) throw new Error('Failed to fetch LLM rooms');

      const json = (await res.json()) as {
        data?: CursorListResponse<AiChatRoom, 'rooms'>;
      };
      const data = json.data;
      if (!data) throw new Error('Invalid response format');

      return {
        rooms: data.rooms,
        lastId: data.lastId ?? null,
        hasNext: data.hasNext,
      } as LlmRoomsPage;
    },
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage: LlmRoomsPage) =>
      lastPage.hasNext ? (lastPage.lastId ?? undefined) : undefined,
    pages: 1,
  });
}
