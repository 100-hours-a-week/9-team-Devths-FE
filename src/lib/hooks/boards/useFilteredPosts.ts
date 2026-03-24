import { useMemo } from 'react';

import { POPULAR_MIN_LIKES } from '@/constants/board';
import { parseBoardDateTime } from '@/lib/utils/board';

import type { BoardPostSummary, BoardSort, BoardTag } from '@/types/board';

type Options = {
  sort: BoardSort;
  selectedTags: BoardTag[];
  followingAuthorIds: number[] | undefined;
};

export function useFilteredPosts(
  rawPosts: BoardPostSummary[],
  options: Options,
): BoardPostSummary[] {
  const { sort, selectedTags, followingAuthorIds } = options;

  return useMemo(() => {
    let filtered = rawPosts;

    if (selectedTags.length > 0) {
      filtered = filtered.filter((post) => selectedTags.some((tag) => post.tags.includes(tag)));
    }

    if (sort === 'POPULAR') {
      filtered = filtered
        .filter((post) => post.stats.likeCount >= POPULAR_MIN_LIKES)
        .sort((a, b) => {
          if (b.stats.likeCount !== a.stats.likeCount) {
            return b.stats.likeCount - a.stats.likeCount;
          }
          return (
            parseBoardDateTime(b.createdAt).getTime() - parseBoardDateTime(a.createdAt).getTime()
          );
        });
    }

    if (sort === 'FOLLOWING') {
      const followingAuthorIdSet = new Set(followingAuthorIds ?? []);
      filtered = filtered.filter((post) => followingAuthorIdSet.has(post.author.userId));
    }

    return filtered;
  }, [rawPosts, selectedTags, sort, followingAuthorIds]);
}
