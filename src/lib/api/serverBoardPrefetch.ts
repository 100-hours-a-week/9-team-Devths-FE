import { QueryClient } from '@tanstack/react-query';
import { cookies } from 'next/headers';

import { BOARD_PAGE_SIZE } from '@/constants/board';
import { boardsKeys } from '@/lib/hooks/boards/queryKeys';

import type { BoardInterest, BoardPostSummary, BoardSort, BoardTag } from '@/types/board';
import type { CommentItem, PostDetail } from '@/types/boardDetail';
import type { CursorPage } from '@/types/pagination';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

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
    next: { revalidate: 30 },
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

async function fetchBoardDetailServer(token: string, postId: number): Promise<PostDetail> {
  const res = await fetch(new URL(`/api/posts/${postId}`, BASE_URL).toString(), {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch post detail');

  const json = (await res.json()) as {
    data?: {
      postId: number;
      title: string;
      content: string;
      attachments: PostDetail['attachments'];
      user: { userId: number; nickname: string; profileImage: string | null; interests: string[] };
      likeCount: number;
      commentCount: number;
      shareCount: number;
      tags: BoardTag[];
      createdAt: string;
      updatedAt: string;
      isLiked: boolean;
    };
  };

  const d = json.data;
  if (!d) throw new Error('Invalid response format');

  return {
    postId: d.postId,
    title: d.title,
    content: d.content,
    attachments: d.attachments,
    author: {
      userId: d.user.userId,
      nickname: d.user.nickname,
      profileImageUrl: d.user.profileImage ?? null,
      interests: d.user.interests as BoardInterest[],
    },
    stats: { likeCount: d.likeCount, commentCount: d.commentCount, shareCount: d.shareCount },
    tags: d.tags,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
    isLiked: d.isLiked,
  };
}

async function fetchBoardCommentsServer(
  token: string,
  postId: number,
  size = 50,
): Promise<CursorPage<CommentItem>> {
  const url = new URL(`/api/posts/${postId}/comments`, BASE_URL);
  url.searchParams.set('size', String(size));

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch comments');

  const json = (await res.json()) as {
    data?: {
      comments: Array<{
        commentId: number;
        parentId: number | null;
        content: string | null;
        user: { userId: number; nickname: string; profileImage: string | null };
        createdAt: string;
        isDeleted: boolean;
      }>;
      lastId: number | null;
      hasNext: boolean;
    };
  };

  const d = json.data;
  if (!d) throw new Error('Invalid response format');

  return {
    items: d.comments.map((c) => ({
      commentId: c.commentId,
      parentId: c.parentId ?? null,
      content: c.content ?? null,
      author: {
        userId: c.user.userId,
        nickname: c.user.nickname,
        profileImageUrl: c.user.profileImage ?? null,
      },
      createdAt: c.createdAt,
      isDeleted: c.isDeleted,
    })),
    lastId: d.lastId ?? null,
    hasNext: d.hasNext,
  };
}

export async function prefetchBoardDetail(queryClient: QueryClient, postId: number): Promise<void> {
  if (!BASE_URL) return;

  const cookieStore = await cookies();
  const token = cookieStore.get('devths_at')?.value;
  if (!token) return;

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: boardsKeys.detail(postId),
      queryFn: () => fetchBoardDetailServer(token, postId),
    }),
    queryClient.prefetchQuery({
      queryKey: boardsKeys.comments(postId, 50),
      queryFn: () => fetchBoardCommentsServer(token, postId),
    }),
  ]);
}

export async function prefetchBoardPosts(queryClient: QueryClient): Promise<void> {
  if (!BASE_URL) return;

  const cookieStore = await cookies();
  const token = cookieStore.get('devths_at')?.value;
  if (!token) return;

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
