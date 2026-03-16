import { QueryClient } from '@tanstack/react-query';
import { cookies } from 'next/headers';

import { BOARD_PAGE_SIZE } from '@/constants/board';
import { boardsKeys } from '@/lib/hooks/boards/queryKeys';

import type { BoardInterest, BoardPostSummary, BoardSort, BoardTag } from '@/types/board';
import type { CursorPage } from '@/types/pagination';

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

async function fetchBoardPostsServer(
  token: string,
  pageParam?: number,
): Promise<CursorPage<BoardPostSummary>> {
  const url = new URL('/api/posts', BASE_URL);
  url.searchParams.set('size', String(BOARD_PAGE_SIZE));
  if (pageParam !== undefined && pageParam !== null) {
    url.searchParams.set('lastId', String(pageParam));
  }

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (!res.ok) throw new Error('Failed to fetch posts');

  const json = (await res.json()) as {
    data?: {
      posts: Array<{
        postId: number;
        title: string;
        previewContent: string;
        user: {
          userId: number;
          nickname: string;
          profileImage: string | null;
          interests: string[];
        };
        likeCount: number;
        commentCount: number;
        shareCount: number;
        tags: string[];
        createdAt: string;
      }>;
      lastId: number | null;
      hasNext: boolean;
    };
  };

  const data = json.data;
  if (!data) throw new Error('Invalid response format');

  return {
    items: data.posts.map((post) => ({
      postId: post.postId,
      title: post.title,
      preview: post.previewContent ?? '',
      tags: post.tags as BoardTag[],
      createdAt: post.createdAt,
      author: {
        userId: post.user.userId,
        nickname: post.user.nickname,
        profileImageUrl: post.user.profileImage ?? null,
        interests: post.user.interests as BoardInterest[],
      },
      stats: {
        likeCount: post.likeCount,
        commentCount: post.commentCount,
        shareCount: post.shareCount,
      },
    })) as BoardPostSummary[],
    lastId: data.lastId ?? null,
    hasNext: data.hasNext,
  };
}

export async function prefetchBoardPosts(queryClient: QueryClient): Promise<void> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ');

  const token = await getServerAccessToken(cookieHeader);
  if (!token || !BASE_URL) return;

  const params = { size: BOARD_PAGE_SIZE, sort: 'LATEST' as BoardSort, tags: [] as BoardTag[] };

  await queryClient.prefetchInfiniteQuery({
    queryKey: boardsKeys.list(params),
    queryFn: ({ pageParam }) => fetchBoardPostsServer(token, pageParam as number | undefined),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage: CursorPage<BoardPostSummary>) =>
      lastPage.hasNext ? (lastPage.lastId ?? undefined) : undefined,
    pages: 1,
  });
}
