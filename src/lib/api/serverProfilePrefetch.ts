import { QueryClient } from '@tanstack/react-query';
import { cookies } from 'next/headers';

import { userKeys } from '@/lib/hooks/users/queryKeys';

import type { MeData, MyPostSummaryData } from '@/lib/api/users';
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

type MyPostsPage = {
  posts: MyPostSummaryData[];
  lastId: number | null;
  hasNext: boolean;
};

export async function prefetchProfile(queryClient: QueryClient): Promise<void> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ');

  const token = await getServerAccessToken(cookieHeader);
  if (!token || !BASE_URL) return;

  const headers = { Authorization: `Bearer ${token}` };

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: userKeys.me(),
      queryFn: async () => {
        const res = await fetch(new URL('/api/users/me', BASE_URL).toString(), {
          headers,
          cache: 'no-store',
        });
        if (!res.ok) throw new Error('Failed to fetch me');
        const json = (await res.json()) as { data?: MeData };
        if (!json.data) throw new Error('Invalid response format');
        return json.data;
      },
    }),
    queryClient.prefetchInfiniteQuery({
      queryKey: userKeys.myPosts({ size: 5 }),
      queryFn: async ({ pageParam }) => {
        const url = new URL('/api/users/me/posts', BASE_URL);
        url.searchParams.set('size', '5');
        if (pageParam !== undefined) url.searchParams.set('lastId', String(pageParam));
        const res = await fetch(url.toString(), { headers, cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch my posts');
        const json = (await res.json()) as {
          data?: CursorListResponse<MyPostSummaryData, 'posts'>;
        };
        if (!json.data) throw new Error('Invalid response format');
        return {
          posts: json.data.posts,
          lastId: json.data.lastId ?? null,
          hasNext: json.data.hasNext,
        } as MyPostsPage;
      },
      initialPageParam: undefined as number | undefined,
      getNextPageParam: (lastPage: MyPostsPage) =>
        lastPage.hasNext ? (lastPage.lastId ?? undefined) : undefined,
      pages: 1,
    }),
  ]);
}
