'use client';

import { useEffect, useMemo, useState } from 'react';

import BoardPostCard from '@/components/board/BoardPostCard';
import BoardSortTabs from '@/components/board/BoardSortTabs';
import BoardTagFilter from '@/components/board/BoardTagFilter';
import { useHeader } from '@/components/layout/HeaderContext';
import { BOARD_TAG_MAX } from '@/constants/board';
import { useBoardListInfiniteQuery } from '@/lib/hooks/boards/useBoardListInfiniteQuery';

import type { BoardSort, BoardTag } from '@/types/board';

const PAGE_SIZE = 10;

export default function BoardListPage() {
  const { setOptions, resetOptions } = useHeader();
  const [sort, setSort] = useState<BoardSort>('LATEST');
  const [selectedTags, setSelectedTags] = useState<BoardTag[]>([]);
  const [isTagOpen, setIsTagOpen] = useState(false);

  const { data, isLoading } = useBoardListInfiniteQuery({
    size: PAGE_SIZE,
    sort,
    tags: selectedTags,
  });

  const posts = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data]);

  useEffect(() => {
    setOptions({
      title: 'Devths',
      showBackButton: false,
    });

    return () => resetOptions();
  }, [resetOptions, setOptions]);

  return (
    <main className="px-3 pt-4 pb-3">
      <div className="flex flex-col gap-3">
        <BoardSortTabs value={sort} onChange={setSort} />
        <BoardTagFilter
          open={isTagOpen}
          onToggleOpen={() => setIsTagOpen((prev) => !prev)}
          selected={selectedTags}
          onChangeSelected={setSelectedTags}
          max={BOARD_TAG_MAX}
        />
      </div>

      <div className="mt-4 space-y-3">
        {isLoading ? (
          <div className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-6 text-center text-sm text-neutral-500">
            게시글을 불러오는 중...
          </div>
        ) : (
          posts.map((post) => <BoardPostCard key={post.postId} post={post} />)
        )}
      </div>
    </main>
  );
}
