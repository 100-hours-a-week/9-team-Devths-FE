'use client';

import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FormEvent, useCallback, useEffect, useState } from 'react';

import { useHeader } from '@/components/layout/HeaderContext';
import { useBoardSearchQuery } from '@/lib/hooks/boards/useBoardSearchQuery';

type KeywordValidationResult = {
  isValid: boolean;
  helperText: string | null;
  normalizedKeyword: string;
};

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

  const { data } = useBoardSearchQuery({
    keyword: submittedKeyword,
    size: 20,
  });

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

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const validation = validateKeyword(keywordInput);
      if (!validation.isValid) {
        setHelperText(validation.helperText);
        return;
      }

      setHelperText(null);
      setSubmittedKeyword(validation.normalizedKeyword);
    },
    [keywordInput],
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

        <section className="rounded-2xl bg-white px-4 py-4 shadow-[0_6px_18px_rgba(15,23,42,0.06)]">
          <p className="text-sm font-semibold text-neutral-900">최근 검색어</p>
          <p className="mt-2 text-xs text-neutral-500">최근 검색어 영역</p>
        </section>

        <section className="rounded-2xl bg-white px-4 py-4 shadow-[0_6px_18px_rgba(15,23,42,0.06)]">
          <p className="text-sm font-semibold text-neutral-900">게시글 ({data?.items.length ?? 0})</p>
          <div className="mt-3 rounded-xl border border-dashed border-neutral-200 px-3 py-6 text-center text-xs text-neutral-500">
            검색 결과 영역
          </div>
        </section>
      </div>
    </main>
  );
}
