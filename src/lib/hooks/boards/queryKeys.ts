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
};
