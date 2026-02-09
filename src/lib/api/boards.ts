import { POPULAR_MIN_LIKES } from '@/constants/board';
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

function applyLocalFilters(items: BoardPostSummary[], sort: BoardSort, tags?: BoardTag[]) {
  let filtered = items;
  if (tags && tags.length > 0) {
    filtered = filtered.filter((post) => tags.some((tag) => post.tags.includes(tag)));
  }

  if (sort === 'POPULAR') {
    filtered = filtered
      .filter((post) => post.stats.likeCount >= POPULAR_MIN_LIKES)
      .sort((a, b) => {
        if (b.stats.likeCount !== a.stats.likeCount) {
          return b.stats.likeCount - a.stats.likeCount;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }

  return filtered;
}

export async function listBoardPosts(
  params: ListBoardPostsParams,
): Promise<CursorPage<BoardPostSummary>> {
  const { size, lastId, sort, tags } = params;
  const queryParams = new URLSearchParams();
  queryParams.set('size', size.toString());
  if (lastId !== null && lastId !== undefined) {
    queryParams.set('lastId', lastId.toString());
  }
  if (tags && tags.length > 0) {
    queryParams.set('tag', tags[0]);
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
  const items = applyLocalFilters(data.posts.map(mapPostSummary), sort, tags);

  return {
    items,
    lastId: data.lastId ?? null,
    hasNext: data.hasNext,
  };
}
