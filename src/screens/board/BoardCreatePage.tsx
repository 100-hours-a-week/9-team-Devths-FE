'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import BoardMarkdownPreview from '@/components/board/BoardMarkdownPreview';
import BoardTagSelector from '@/components/board/BoardTagSelector';
import { useHeader } from '@/components/layout/HeaderContext';
import { BOARD_TITLE_MAX_LENGTH } from '@/constants/boardCreate';
import { validateBoardCreateTitle } from '@/lib/validators/boardCreate';

import type { BoardTag } from '@/types/board';

export default function BoardCreatePage() {
  const router = useRouter();
  const { setOptions, resetOptions } = useHeader();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [tags, setTags] = useState<BoardTag[]>([]);
  const titleError = useMemo(() => validateBoardCreateTitle(title), [title]);

  const handleBackClick = useCallback(() => {
    router.push('/board');
  }, [router]);

  const rightSlot = useMemo(
    () => (
      <button
        type="button"
        disabled
        className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-semibold text-neutral-400"
      >
        등록
      </button>
    ),
    [],
  );

  useEffect(() => {
    setOptions({
      title: '게시글 작성',
      showBackButton: true,
      onBackClick: handleBackClick,
      rightSlot,
    });

    return () => resetOptions();
  }, [handleBackClick, resetOptions, rightSlot, setOptions]);

  return (
    <main className="px-3 pt-4 pb-6">
      <section className="sticky top-14 z-10 rounded-2xl bg-neutral-50 px-4 py-3 text-xs text-neutral-600">
        연락처, 계좌번호, 주민번호 등 개인정보 공유를 삼가해 주세요.
      </section>

      <section className="mt-4 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-neutral-900">제목</span>
            <span className="text-xs text-rose-500">*</span>
          </div>
          <input
            type="text"
            value={title}
            maxLength={BOARD_TITLE_MAX_LENGTH}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="제목을 입력하세요"
            className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-[#05C075] focus:ring-2 focus:ring-[#05C075]/20 focus:outline-none"
          />
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>{titleError ?? ' '}</span>
            <span>
              {title.trim().length}/{BOARD_TITLE_MAX_LENGTH}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-neutral-900">내용</span>
              <span className="text-xs text-rose-500">*</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPreview(false)}
                className={
                  isPreview
                    ? 'rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-xs font-semibold text-neutral-500'
                    : 'rounded-full bg-neutral-900 px-2.5 py-1 text-xs font-semibold text-white'
                }
              >
                편집
              </button>
              <button
                type="button"
                onClick={() => setIsPreview(true)}
                className={
                  isPreview
                    ? 'rounded-full bg-neutral-900 px-2.5 py-1 text-xs font-semibold text-white'
                    : 'rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-xs font-semibold text-neutral-500'
                }
              >
                미리보기
              </button>
            </div>
          </div>

          {isPreview ? (
            <div className="min-h-[180px] rounded-2xl border border-neutral-200 bg-white px-4 py-3">
              <BoardMarkdownPreview content={content} />
            </div>
          ) : (
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="마크다운으로 작성해 보세요. 예: # 제목, - 목록, ```코드```"
              className="min-h-[180px] w-full resize-none rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-[#05C075] focus:ring-2 focus:ring-[#05C075]/20 focus:outline-none"
            />
          )}
        </div>

        <BoardTagSelector value={tags} onChange={setTags} />

        <div className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-4 text-sm text-neutral-400">
          첨부 영역이 여기에 들어갈 예정입니다.
        </div>
      </section>
    </main>
  );
}
