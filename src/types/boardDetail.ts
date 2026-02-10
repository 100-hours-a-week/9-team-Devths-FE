import type { BoardAuthor, BoardTag } from '@/types/board';

export type ReactionCounts = {
  likeCount: number;
  commentCount: number;
  shareCount: number;
};

export type PostDetailAttachment = {
  fileId: number;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: 'IMAGE' | 'VIDEO' | 'FILE';
  sortOrder: number;
};

export type PostDetailResponse = {
  postId: number;
  title: string;
  content: string;
  attachments: PostDetailAttachment[];
  user: {
    userId: number;
    nickname: string;
    profileImage: string | null;
    interests: string[];
  };
  likeCount: number;
  commentCount: number;
  shareCount: number;
  tags: BoardTag[];
  createdAt: string;
  updatedAt: string;
  isLiked: boolean;
};

export type PostDetail = {
  postId: number;
  title: string;
  content: string;
  attachments: PostDetailAttachment[];
  author: BoardAuthor;
  stats: ReactionCounts;
  tags: BoardTag[];
  createdAt: string;
  updatedAt: string;
  isLiked: boolean;
};

export type CommentAuthor = {
  userId: number;
  nickname: string;
  profileImageUrl?: string | null;
};

export type CommentItemResponse = {
  commentId: number;
  parentId: number | null;
  content: string | null;
  user: {
    userId: number;
    nickname: string;
    profileImage: string | null;
  };
  createdAt: string;
  isDeleted: boolean;
};

export type CommentListResponse = {
  comments: CommentItemResponse[];
  lastId: number | null;
  hasNext: boolean;
};

export type CommentItem = {
  commentId: number;
  parentId: number | null;
  content: string | null;
  author: CommentAuthor;
  createdAt: string;
  isDeleted: boolean;
};

export type CommentThread = {
  comment: CommentItem;
  replies: CommentItem[];
};
