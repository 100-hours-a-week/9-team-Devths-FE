import type { BoardSort, BoardTag } from '@/types/board';

type BoardListParams = {
  size: number;
  sort: BoardSort;
  tags?: BoardTag[];
};

type BoardSearchParams = {
  size: number;
  keyword: string;
  lastId?: number | null;
};

const normalizeBoardSearchParams = (params: BoardSearchParams) => ({
  size: params.size,
  keyword: params.keyword.trim(),
  lastId: params.lastId ?? null,
});

export const boardsKeys = {
  all: ['boards'] as const,
  list: (params: BoardListParams) => [...boardsKeys.all, 'list', params] as const,
  search: (params: BoardSearchParams) =>
    [...boardsKeys.all, 'search', normalizeBoardSearchParams(params)] as const,
  detail: (postId: number) => [...boardsKeys.all, 'detail', postId] as const,
  comments: (postId: number, size: number) =>
    [...boardsKeys.all, 'comments', postId, size] as const,
};
