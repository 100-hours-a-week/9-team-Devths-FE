import { api } from '@/lib/api/client';

import type { BoardInterest, BoardPostSummary, BoardSort, BoardTag } from '@/types/board';
import type { CursorPage } from '@/types/pagination';

type ListBoardPostsParams = {
  size: number;
  lastId?: number | null;
  sort: BoardSort;
  tags?: BoardTag[];
};

type PostAuthorInfoResponse = {
  userId: number;
  nickname: string;
  profileImage: string | null;
  interests: string[];
};

type PostSummaryResponse = {
  postId: number;
  title: string;
  previewContent: string;
  user: PostAuthorInfoResponse;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  tags: string[];
  createdAt: string;
};

type PostListResponse = {
  posts: PostSummaryResponse[];
  lastId: number | null;
  hasNext: boolean;
};

function mapPostSummary(post: PostSummaryResponse): BoardPostSummary {
  return {
    postId: post.postId,
    title: post.title,
    preview: post.previewContent ?? '',
    tags: (post.tags ?? []) as BoardTag[],
    createdAt: post.createdAt,
    author: {
      userId: post.user.userId,
      nickname: post.user.nickname,
      profileImageUrl: post.user.profileImage ?? null,
      interests: (post.user.interests ?? []) as BoardInterest[],
    },
    stats: {
      likeCount: post.likeCount,
      commentCount: post.commentCount,
      shareCount: post.shareCount,
    },
  };
}

export async function listBoardPosts(
  params: ListBoardPostsParams,
): Promise<CursorPage<BoardPostSummary>> {
  const { size, lastId } = params;
  const queryParams = new URLSearchParams();
  queryParams.set('size', size.toString());
  if (lastId !== null && lastId !== undefined) {
    queryParams.set('lastId', lastId.toString());
  }

  const path = queryParams.toString() ? `/api/posts?${queryParams.toString()}` : '/api/posts';
  const result = await api.get<PostListResponse>(path, { credentials: 'include' });

  if (!result.ok || !result.json) {
    throw new Error('Failed to fetch posts');
  }

  if (!('data' in result.json) || !result.json.data) {
    throw new Error('Invalid response format');
  }

  const data = result.json.data;
  const items = data.posts.map(mapPostSummary);

  return {
    items,
    lastId: data.lastId ?? null,
    hasNext: data.hasNext,
  };
}
