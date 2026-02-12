'use client';

import { Loader2, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';

import BoardPostCard from '@/components/board/BoardPostCard';
import { useHeader } from '@/components/layout/HeaderContext';
import { useBoardSearchQuery } from '@/lib/hooks/boards/useBoardSearchQuery';

const RECENT_SEARCH_STORAGE_KEY = 'devths_board_recent_searches';
const MAX_RECENT_SEARCH_COUNT = 10;
const SEARCH_PAGE_SIZE = 20;
const PAGE_NUMBER_WINDOW_SIZE = 5;

type KeywordValidationResult = {
  isValid: boolean;
  helperText: string | null;
  normalizedKeyword: string;
};

function readRecentKeywords(): string[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(RECENT_SEARCH_STORAGE_KEY);
    if (raw === null) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((value): value is string => typeof value === 'string')
      .map((value) => value.trim())
      .filter((value) => value.length > 0)
      .slice(0, MAX_RECENT_SEARCH_COUNT);
  } catch {
    return [];
  }
}

function writeRecentKeywords(keywords: string[]) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(RECENT_SEARCH_STORAGE_KEY, JSON.stringify(keywords));
}

function addRecentKeyword(previousKeywords: string[], keyword: string) {
  const deduplicated = previousKeywords.filter((item) => item !== keyword);
  return [keyword, ...deduplicated].slice(0, MAX_RECENT_SEARCH_COUNT);
}

function validateKeyword(value: string): KeywordValidationResult {
  const normalizedKeyword = value.trim();

  if (normalizedKeyword.length === 0) {
    return {
      isValid: false,
      helperText: '검색어를 입력해 주세요.',
      normalizedKeyword,
    };
  }

  if (normalizedKeyword.length < 2) {
    return {
      isValid: false,
      helperText: '검색어는 2자 이상 입력해 주세요.',
      normalizedKeyword,
    };
  }

  if (normalizedKeyword.length > 30) {
    return {
      isValid: false,
      helperText: '검색어는 최대 30자까지 입력할 수 있습니다.',
      normalizedKeyword,
    };
  }

  return {
    isValid: true,
    helperText: null,
    normalizedKeyword,
  };
}

export default function BoardSearchPage() {
  const router = useRouter();
  const { setOptions, resetOptions } = useHeader();
  const [keywordInput, setKeywordInput] = useState('');
  const [submittedKeyword, setSubmittedKeyword] = useState('');
  const [helperText, setHelperText] = useState<string | null>(null);
  const [recentKeywords, setRecentKeywords] = useState<string[]>(() => readRecentKeywords());
  const [currentPage, setCurrentPage] = useState(1);
  const [currentLastId, setCurrentLastId] = useState<number | null>(null);
  const [pageCursorMap, setPageCursorMap] = useState<Record<number, number | null>>({ 1: null });

  const { data, isLoading, isError, error, refetch } = useBoardSearchQuery({
    keyword: submittedKeyword,
    size: SEARCH_PAGE_SIZE,
    lastId: currentLastId,
  });
  const posts = data?.items ?? [];
  const hasSubmittedKeyword = submittedKeyword.length > 0;
  const resultCount = posts.length;

  const effectivePageCursorMap = useMemo(() => {
    if (!data?.hasNext || data.lastId === null) {
      return pageCursorMap;
    }

    if (pageCursorMap[currentPage + 1] !== undefined) {
      return pageCursorMap;
    }

    return {
      ...pageCursorMap,
      [currentPage + 1]: data.lastId,
    };
  }, [currentPage, data, pageCursorMap]);

  const hasNextPage = Boolean(
    effectivePageCursorMap[currentPage + 1] !== undefined || (data?.hasNext && data.lastId !== null),
  );
  const canGoPreviousPage = currentPage > 1;

  const pageNumbers = useMemo(() => {
    const maxPage = Math.max(1, ...Object.keys(effectivePageCursorMap).map(Number));
    const start = Math.floor((currentPage - 1) / PAGE_NUMBER_WINDOW_SIZE) * PAGE_NUMBER_WINDOW_SIZE + 1;
    const end = Math.min(start + PAGE_NUMBER_WINDOW_SIZE - 1, maxPage);
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }, [currentPage, effectivePageCursorMap]);

  const handleBackClick = useCallback(() => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }
    router.push('/board');
  }, [router]);

  useEffect(() => {
    setOptions({
      title: '게시글 검색',
      showBackButton: true,
      onBackClick: handleBackClick,
    });

    return () => resetOptions();
  }, [handleBackClick, resetOptions, setOptions]);

  const executeSearch = useCallback((rawKeyword: string) => {
    const validation = validateKeyword(rawKeyword);
    if (!validation.isValid) {
      setHelperText(validation.helperText);
      return;
    }

    setHelperText(null);
    setCurrentPage(1);
    setCurrentLastId(null);
    setPageCursorMap({ 1: null });
    setSubmittedKeyword(validation.normalizedKeyword);
    setRecentKeywords((previousKeywords) => {
      const nextKeywords = addRecentKeyword(previousKeywords, validation.normalizedKeyword);
      writeRecentKeywords(nextKeywords);
      return nextKeywords;
    });
  }, []);

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      executeSearch(keywordInput);
    },
    [executeSearch, keywordInput],
  );

  const handleKeywordChange = useCallback(
    (value: string) => {
      setKeywordInput(value);

      if (helperText === null) {
        return;
      }

      const validation = validateKeyword(value);
      setHelperText(validation.helperText);
    },
    [helperText],
  );

  const handleRecentKeywordClick = useCallback(
    (keyword: string) => {
      setKeywordInput(keyword);
      executeSearch(keyword);
    },
    [executeSearch],
  );

  const handleRecentKeywordDelete = useCallback((keyword: string) => {
    setRecentKeywords((previousKeywords) => {
      const nextKeywords = previousKeywords.filter((item) => item !== keyword);
      writeRecentKeywords(nextKeywords);
      return nextKeywords;
    });
  }, []);

  const handlePostClick = useCallback(
    (postId: number) => {
      router.push(`/board/${postId}`);
    },
    [router],
  );

  const moveToPage = (targetPage: number) => {
    if (targetPage === currentPage) {
      return;
    }

    const targetCursor = effectivePageCursorMap[targetPage];
    if (targetCursor === undefined) {
      return;
    }

    if (pageCursorMap[targetPage] === undefined) {
      setPageCursorMap((previousMap) => ({
        ...previousMap,
        [targetPage]: targetCursor,
      }));
    }

    setCurrentPage(targetPage);
    setCurrentLastId(targetCursor);
  };

  const handlePreviousPage = () => {
    if (!canGoPreviousPage) {
      return;
    }
    moveToPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (!hasNextPage) {
      return;
    }

    const nextCursor = effectivePageCursorMap[currentPage + 1];
    if (nextCursor !== undefined) {
      if (pageCursorMap[currentPage + 1] === undefined) {
        setPageCursorMap((previousMap) => ({
          ...previousMap,
          [currentPage + 1]: nextCursor,
        }));
      }

      setCurrentPage(currentPage + 1);
      setCurrentLastId(nextCursor);
    }
  };

  return (
    <main className="px-3 pt-4 pb-3">
      <div className="space-y-4">
        <section className="rounded-2xl bg-white px-4 py-4 shadow-[0_6px_18px_rgba(15,23,42,0.06)]">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search"
                value={keywordInput}
                onChange={(event) => handleKeywordChange(event.target.value)}
                className="h-10 w-full rounded-xl border border-neutral-200 bg-white pr-3 pl-9 text-sm text-neutral-900 outline-none transition focus:border-emerald-500"
              />
            </div>
            <button
              type="submit"
              aria-label="게시글 검색"
              className="h-10 shrink-0 rounded-xl bg-emerald-600 px-3 text-sm font-medium text-white transition hover:bg-emerald-700"
            >
              검색
            </button>
          </form>
          {helperText !== null ? (
            <p className="mt-2 text-xs text-red-500">{helperText}</p>
          ) : null}
        </section>

        {recentKeywords.length > 0 ? (
          <section className="rounded-2xl bg-white px-4 py-4 shadow-[0_6px_18px_rgba(15,23,42,0.06)]">
            <p className="text-sm font-semibold text-neutral-900">최근 검색어</p>
            <ul className="mt-2 space-y-2">
              {recentKeywords.map((keyword) => (
                <li key={keyword} className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleRecentKeywordClick(keyword)}
                    className="min-w-0 flex-1 truncate text-left text-sm text-neutral-700 transition hover:text-emerald-700"
                  >
                    {keyword}
                  </button>
                  <button
                    type="button"
                    aria-label={`${keyword} 최근 검색어 삭제`}
                    onClick={() => handleRecentKeywordDelete(keyword)}
                    className="rounded-md px-1 text-sm text-neutral-400 transition hover:text-neutral-700"
                  >
                    X
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="rounded-2xl bg-white px-4 py-4 shadow-[0_6px_18px_rgba(15,23,42,0.06)]">
          <p className="text-sm font-semibold text-neutral-900">게시글 ({resultCount})</p>
          <div className="mt-3">
            {!hasSubmittedKeyword ? (
              <div className="rounded-xl border border-dashed border-neutral-200 px-3 py-6 text-center text-xs text-neutral-500">
                검색어를 입력하고 검색해 주세요.
              </div>
            ) : isLoading ? (
              <div className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-200 px-3 py-6 text-xs text-neutral-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>검색 결과를 불러오는 중...</span>
              </div>
            ) : isError ? (
              <div className="rounded-xl border border-dashed border-neutral-200 px-3 py-6 text-center text-xs text-neutral-500">
                <p>{error instanceof Error ? error.message : '검색 결과를 불러오지 못했습니다.'}</p>
                <button
                  type="button"
                  onClick={() => void refetch()}
                  className="mt-3 rounded-full border border-neutral-200 bg-white px-4 py-1 text-[11px] font-semibold text-neutral-700 transition hover:bg-neutral-50"
                >
                  다시 시도
                </button>
              </div>
            ) : resultCount === 0 ? (
              <div className="rounded-xl border border-dashed border-neutral-200 px-3 py-6 text-center text-xs text-neutral-500">
                검색 결과가 없습니다.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-3">
                  {posts.map((post) => (
                    <BoardPostCard key={post.postId} post={post} onClick={handlePostClick} />
                  ))}
                </div>

                <div className="flex items-center justify-center gap-1">
                  <button
                    type="button"
                    onClick={handlePreviousPage}
                    disabled={!canGoPreviousPage}
                    className="rounded-lg border border-neutral-200 px-2.5 py-1.5 text-xs text-neutral-700 transition disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    이전
                  </button>

                  {pageNumbers.map((pageNumber) => (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() => moveToPage(pageNumber)}
                      className={`min-w-8 rounded-lg px-2.5 py-1.5 text-xs transition ${
                        currentPage === pageNumber
                          ? 'bg-emerald-600 font-semibold text-white'
                          : 'border border-neutral-200 text-neutral-700'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={handleNextPage}
                    disabled={!hasNextPage}
                    className="rounded-lg border border-neutral-200 px-2.5 py-1.5 text-xs text-neutral-700 transition disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    다음
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
