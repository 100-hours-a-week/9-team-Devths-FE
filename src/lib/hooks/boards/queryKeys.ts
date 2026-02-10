import type { BoardSort, BoardTag } from '@/types/board';

type BoardListParams = {
  size: number;
  sort: BoardSort;
  tags?: BoardTag[];
};

export const boardsKeys = {
  all: ['boards'] as const,
  list: (params: BoardListParams) => [...boardsKeys.all, 'list', params] as const,
  detail: (postId: number) => [...boardsKeys.all, 'detail', postId] as const,
  comments: (postId: number, size: number) =>
    [...boardsKeys.all, 'comments', postId, size] as const,
};
