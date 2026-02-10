import { api } from '@/lib/api/client';

import type { BoardInterest, BoardPostSummary, BoardSort, BoardTag } from '@/types/board';
import type {
  CommentItem,
  CommentItemResponse,
  CommentListResponse,
  PostDetail,
  PostDetailResponse,
} from '@/types/boardDetail';
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

type PostLikeResponse = {
  postId: number;
  likeCount: number;
};

function mapPostDetail(detail: PostDetailResponse): PostDetail {
  return {
    postId: detail.postId,
    title: detail.title,
    content: detail.content,
    attachments: detail.attachments ?? [],
    author: {
      userId: detail.user.userId,
      nickname: detail.user.nickname,
      profileImageUrl: detail.user.profileImage ?? null,
      interests: (detail.user.interests ?? []) as BoardInterest[],
    },
    stats: {
      likeCount: detail.likeCount,
      commentCount: detail.commentCount,
      shareCount: detail.shareCount,
    },
    tags: (detail.tags ?? []) as BoardTag[],
    createdAt: detail.createdAt,
    updatedAt: detail.updatedAt,
    isLiked: detail.isLiked,
  };
}

function mapCommentItem(comment: CommentItemResponse): CommentItem {
  return {
    commentId: comment.commentId,
    parentId: comment.parentId ?? null,
    content: comment.content ?? null,
    author: {
      userId: comment.user.userId,
      nickname: comment.user.nickname,
      profileImageUrl: comment.user.profileImage ?? null,
    },
    createdAt: comment.createdAt,
    isDeleted: comment.isDeleted,
  };
}

type CreateBoardPostRequest = {
  title: string;
  content: string;
  tags?: BoardTag[];
  fileIds?: number[];
};

type CreateBoardPostResponse = {
  postId: number;
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

export async function createBoardPost(payload: CreateBoardPostRequest) {
  const result = await api.post<CreateBoardPostResponse>('/api/posts', payload, {
    credentials: 'include',
  });

  if (!result.ok || !result.json) {
    throw new Error('게시글 등록에 실패했습니다.');
  }

  if (!('data' in result.json) || !result.json.data) {
    throw new Error('Invalid response format');
  }

  return result.json.data;
}

export async function getBoardPostDetail(postId: number): Promise<PostDetail> {
  const result = await api.get<PostDetailResponse>(`/api/posts/${postId}`, { credentials: 'include' });

  if (!result.ok || !result.json) {
    throw new Error('게시글을 불러오지 못했습니다.');
  }

  if (!('data' in result.json) || !result.json.data) {
    throw new Error('Invalid response format');
  }

  return mapPostDetail(result.json.data);
}

export async function listBoardComments(
  postId: number,
  size = 50,
  lastId?: number | null,
): Promise<CursorPage<CommentItem>> {
  const queryParams = new URLSearchParams();
  queryParams.set('size', size.toString());
  if (lastId !== null && lastId !== undefined) {
    queryParams.set('lastId', lastId.toString());
  }

  const path = queryParams.toString()
    ? `/api/posts/${postId}/comments?${queryParams.toString()}`
    : `/api/posts/${postId}/comments`;
  const result = await api.get<CommentListResponse>(path, { credentials: 'include' });

  if (!result.ok || !result.json) {
    throw new Error('댓글을 불러오지 못했습니다.');
  }

  if (!('data' in result.json) || !result.json.data) {
    throw new Error('Invalid response format');
  }

  const data = result.json.data;
  const items = data.comments.map(mapCommentItem);

  return {
    items,
    lastId: data.lastId ?? null,
    hasNext: data.hasNext,
  };
}

export async function likeBoardPost(postId: number): Promise<PostLikeResponse> {
  const result = await api.post<PostLikeResponse>(`/api/posts/${postId}/likes`, undefined, {
    credentials: 'include',
  });

  if (!result.ok || !result.json) {
    throw new Error('좋아요에 실패했습니다.');
  }

  if (!('data' in result.json) || !result.json.data) {
    throw new Error('Invalid response format');
  }

  return result.json.data;
}

export async function unlikeBoardPost(postId: number): Promise<void> {
  const result = await api.delete<void>(`/api/posts/${postId}/likes`, { credentials: 'include' });

  if (!result.ok) {
    throw new Error('좋아요 취소에 실패했습니다.');
  }
}
