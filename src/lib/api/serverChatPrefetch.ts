import { QueryClient } from '@tanstack/react-query';
import { cookies } from 'next/headers';

import { ROOM_PAGE_SIZE } from '@/constants/chat';
import { chatKeys } from '@/lib/hooks/chat/queryKeys';

import type { ChatRoomListResponse } from '@/lib/api/chatRooms';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

async function fetchChatRoomsServer(token: string, size: number): Promise<ChatRoomListResponse> {
  const url = new URL('/api/chatrooms', BASE_URL);
  url.searchParams.set('type', 'PRIVATE');
  url.searchParams.set('size', String(size));

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 30 },
  });
  if (!res.ok) throw new Error('Failed to fetch chat rooms');

  const json = (await res.json()) as { data?: ChatRoomListResponse };
  const data = json.data;
  if (!data) throw new Error('Invalid response format');

  return data;
}

export async function prefetchChatRooms(queryClient: QueryClient): Promise<void> {
  if (!BASE_URL) return;

  const cookieStore = await cookies();
  const token = cookieStore.get('devths_at')?.value;
  if (!token) return;

  await queryClient.prefetchInfiniteQuery({
    queryKey: chatKeys.rooms({ size: ROOM_PAGE_SIZE, cursor: null }),
    queryFn: () => fetchChatRoomsServer(token, ROOM_PAGE_SIZE),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: ChatRoomListResponse) =>
      lastPage.hasNext ? (lastPage.cursor ?? undefined) : undefined,
    pages: 1,
  });
}
