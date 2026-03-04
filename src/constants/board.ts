import type { BoardSort, BoardTag } from '@/types/board';

export const BOARD_TAGS = [
  '이력서',
  '포트폴리오',
  '면접',
  '코딩테스트',
] as const satisfies readonly BoardTag[];

export const BOARD_TAG_MAX = 4;

export const BOARD_SORT_OPTIONS = [
  { key: 'LATEST', label: '최신순' },
  { key: 'POPULAR', label: '인기순' },
  { key: 'FOLLOWING', label: '팔로잉' },
] as const satisfies readonly { key: BoardSort; label: string }[];

export const POPULAR_MIN_LIKES = 500;

export const BOARD_PAGE_SIZE = 10;
export const FOLLOWINGS_FETCH_SIZE = 100;
export const PULL_MAX = 120;
export const PULL_THRESHOLD = 72;

export const RECENT_SEARCH_STORAGE_KEY = 'devths_board_recent_searches';
export const MAX_RECENT_SEARCH_COUNT = 10;
export const SEARCH_PAGE_SIZE = 20;
export const SEARCH_QUERY_PARAM_KEY = 'q';
