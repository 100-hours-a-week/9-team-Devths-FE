'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import BoardAttachmentCard from '@/components/board/BoardAttachmentCard';
import BoardAttachmentPreviewModal from '@/components/board/BoardAttachmentPreviewModal';
import BoardMarkdownPreview from '@/components/board/BoardMarkdownPreview';
import BoardTagSelector from '@/components/board/BoardTagSelector';
import BoardFileTooLargeModal from '@/components/board/modals/BoardFileTooLargeModal';
import BoardPartialAttachFailModal from '@/components/board/modals/BoardPartialAttachFailModal';
import BoardUnsupportedFileModal from '@/components/board/modals/BoardUnsupportedFileModal';
import { useHeader } from '@/components/layout/HeaderContext';
import {
  BOARD_ATTACHMENT_CONSTRAINTS,
  BOARD_FILE_MIME_TYPES,
  BOARD_IMAGE_MIME_TYPES,
  BOARD_TITLE_MAX_LENGTH,
} from '@/constants/boardCreate';
import { useBoardAttachments } from '@/lib/hooks/boards/useBoardAttachments';
import { validateFiles } from '@/lib/validators/attachment';
import { validateBoardCreateTitle } from '@/lib/validators/boardCreate';

import type { BoardTag } from '@/types/board';
import type { BoardAttachment } from '@/types/boardCreate';

export default function BoardCreatePage() {
  const router = useRouter();
  const { setOptions, resetOptions } = useHeader();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [tags, setTags] = useState<BoardTag[]>([]);
  const { attachments, addAttachments, removeAttachment } = useBoardAttachments();
  const [previewAttachment, setPreviewAttachment] = useState<BoardAttachment | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const titleError = useMemo(() => validateBoardCreateTitle(title), [title]);
  const [fileTooLargeOpen, setFileTooLargeOpen] = useState(false);
  const [unsupportedFileOpen, setUnsupportedFileOpen] = useState(false);
  const [partialFailOpen, setPartialFailOpen] = useState(false);

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

  const handlePickImages = useCallback(() => {
    imageInputRef.current?.click();
  }, []);

  const handlePickFiles = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const openErrorModal = useCallback((errors: Array<{ code: string }>, hasSuccess: boolean) => {
    if (hasSuccess && errors.length > 0) {
      setPartialFailOpen(true);
      return;
    }

    const hasTooLarge = errors.some((error) => error.code === 'FILE_TOO_LARGE');
    if (hasTooLarge) {
      setFileTooLargeOpen(true);
      return;
    }

    const hasInvalidType = errors.some((error) => error.code === 'INVALID_MIME_TYPE');
    if (hasInvalidType) {
      setUnsupportedFileOpen(true);
      return;
    }

    if (errors.length > 0) {
      setPartialFailOpen(true);
    }
  }, []);

  const handleImagesChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);
      if (files.length === 0) return;
      const existingImages = attachments.filter((item) => item.type === 'IMAGE').length;
      const existingFiles = attachments.filter((item) => item.type === 'PDF').length;
      const { okFiles, errors } = validateFiles(
        files,
        BOARD_ATTACHMENT_CONSTRAINTS,
        existingImages,
        existingFiles,
      );
      if (okFiles.length > 0) {
        addAttachments(okFiles, 'IMAGE');
      }
      if (errors.length > 0) {
        openErrorModal(errors, okFiles.length > 0);
      }
      event.target.value = '';
    },
    [addAttachments, attachments, openErrorModal],
  );

  const handleFilesChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);
      if (files.length === 0) return;
      const existingImages = attachments.filter((item) => item.type === 'IMAGE').length;
      const existingFiles = attachments.filter((item) => item.type === 'PDF').length;
      const { okFiles, errors } = validateFiles(
        files,
        BOARD_ATTACHMENT_CONSTRAINTS,
        existingImages,
        existingFiles,
      );
      if (okFiles.length > 0) {
        addAttachments(okFiles, 'PDF');
      }
      if (errors.length > 0) {
        openErrorModal(errors, okFiles.length > 0);
      }
      event.target.value = '';
    },
    [addAttachments, attachments, openErrorModal],
  );

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

        <div className="space-y-2">
          <span className="text-sm font-semibold text-neutral-900">첨부</span>
          <div className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-4">
            <div className="flex flex-col gap-2 text-sm text-neutral-500">
              <button
                type="button"
                onClick={handlePickImages}
                className="inline-flex items-center justify-between rounded-xl border border-neutral-200 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
              >
                사진 업로드
                <span className="text-xs text-neutral-400">
                  {BOARD_IMAGE_MIME_TYPES.join(', ')}
                </span>
              </button>
              <button
                type="button"
                onClick={handlePickFiles}
                className="inline-flex items-center justify-between rounded-xl border border-neutral-200 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
              >
                파일 업로드
                <span className="text-xs text-neutral-400">{BOARD_FILE_MIME_TYPES.join(', ')}</span>
              </button>
            </div>
            <p className="mt-3 text-xs text-neutral-400">
              첨부 파일은 최대 10MB, PDF/JPG/JPEG/PNG 형식을 지원합니다.
            </p>
            {attachments.length > 0 ? (
              <p className="mt-2 text-xs text-neutral-400">현재 첨부 {attachments.length}개</p>
            ) : null}
          </div>
          {attachments.length > 0 ? (
            <div className="mt-3 grid gap-3">
              {attachments.map((attachment) => (
                <BoardAttachmentCard
                  key={attachment.id}
                  attachment={attachment}
                  onRemove={removeAttachment}
                  onPreview={(target) => setPreviewAttachment(target)}
                />
              ))}
            </div>
          ) : null}
          <input
            ref={imageInputRef}
            type="file"
            accept={BOARD_IMAGE_MIME_TYPES.join(',')}
            multiple
            onChange={handleImagesChange}
            className="hidden"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept={BOARD_FILE_MIME_TYPES.join(',')}
            multiple
            onChange={handleFilesChange}
            className="hidden"
          />
        </div>
      </section>

      <BoardFileTooLargeModal open={fileTooLargeOpen} onClose={() => setFileTooLargeOpen(false)} />
      <BoardUnsupportedFileModal
        open={unsupportedFileOpen}
        onClose={() => setUnsupportedFileOpen(false)}
      />
      <BoardPartialAttachFailModal
        open={partialFailOpen}
        onClose={() => setPartialFailOpen(false)}
      />
      <BoardAttachmentPreviewModal
        open={previewAttachment !== null}
        onClose={() => setPreviewAttachment(null)}
        attachment={previewAttachment}
      />
    </main>
  );
}
