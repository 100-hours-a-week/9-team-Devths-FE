'use client';

import clsx from 'clsx';
import { FileText, Image as ImageIcon, X } from 'lucide-react';

type Props = {
  open: boolean;
  title?: string;
  onClose: () => void;
  onPickImages: () => void;
  onPickFile: () => void;
};

export default function LlmAttachmentSheet({
  open,
  title = '첨부 선택',
  onClose,
  onPickImages,
  onPickFile,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-label="닫기"
      />

      <div className="absolute bottom-0 left-1/2 w-full -translate-x-1/2 sm:max-w-[430px]">
        <div className="rounded-t-3xl bg-white p-5 shadow-2xl">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-neutral-900">{title}</p>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-neutral-100"
              aria-label="닫기"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-3 space-y-2">
            <button
              type="button"
              onClick={() => {
                onPickImages();
                onClose();
              }}
              className={clsx(
                'flex w-full items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-left',
                'hover:bg-neutral-50',
              )}
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100">
                <ImageIcon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-neutral-900">이미지 첨부</p>
                <p className="mt-0.5 text-xs text-neutral-500">JPG/JPEG/PNG · 최대 9장 · 10MB</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                onPickFile();
                onClose();
              }}
              className={clsx(
                'flex w-full items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-left',
                'hover:bg-neutral-50',
              )}
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100">
                <FileText className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-neutral-900">파일 첨부</p>
                <p className="mt-0.5 text-xs text-neutral-500">PDF · 최대 1개 · 10MB · 10장 이하</p>
              </div>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="mt-1 w-full rounded-2xl bg-neutral-900 py-3 text-sm font-semibold text-white hover:bg-neutral-800"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
