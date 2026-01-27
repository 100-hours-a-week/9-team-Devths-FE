'use client';

import { FileText, Image as ImageIcon, X } from 'lucide-react';

import type { ClipboardEvent, ReactNode } from 'react';

type AttachmentFile = {
  images: File[];
  pdf: File | null;
};

type Props = {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  onPasteBlocked?: () => void;
  helperText?: string;
  headerRight?: ReactNode;
  attachments?: AttachmentFile;
  onRemoveImage?: (index: number) => void;
  onRemovePdf?: () => void;
  textDisabled?: boolean;
};

export default function LlmTextAreaCard({
  label,
  placeholder,
  value,
  onChange,
  onPasteBlocked,
  helperText,
  headerRight,
  attachments,
  onRemoveImage,
  onRemovePdf,
  textDisabled,
}: Props) {
  const handlePaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const files = e.clipboardData?.files;
    if (files && files.length > 0) {
      e.preventDefault();
      onPasteBlocked?.();
    }
  };

  const hasAttachments = attachments && (attachments.images.length > 0 || attachments.pdf !== null);

  return (
    <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-neutral-900">{label}</h2>
        {headerRight}
      </div>

      <textarea
        className={[
          'mt-3 min-h-[140px] w-full resize-none rounded-2xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm outline-none focus:border-neutral-400',
          textDisabled ? 'cursor-not-allowed opacity-50' : '',
        ].join(' ')}
        placeholder={textDisabled ? '파일이 첨부되어 텍스트 입력이 비활성화되었습니다.' : placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onPaste={handlePaste}
        disabled={textDisabled}
      />

      {hasAttachments && (
        <div className="mt-3 flex flex-wrap gap-2">
          {attachments.images.map((file, idx) => (
            <div
              key={`img-${idx}`}
              className="flex items-center gap-2 rounded-lg bg-neutral-100 px-3 py-2"
            >
              <ImageIcon className="h-4 w-4 text-neutral-500" />
              <span className="max-w-[120px] truncate text-xs text-neutral-700">{file.name}</span>
              {onRemoveImage && (
                <button
                  type="button"
                  onClick={() => onRemoveImage(idx)}
                  className="ml-1 rounded-full p-0.5 hover:bg-neutral-200"
                >
                  <X className="h-3 w-3 text-neutral-500" />
                </button>
              )}
            </div>
          ))}
          {attachments.pdf && (
            <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2">
              <FileText className="h-4 w-4 text-blue-500" />
              <span className="max-w-[120px] truncate text-xs text-blue-700">
                {attachments.pdf.name}
              </span>
              {onRemovePdf && (
                <button
                  type="button"
                  onClick={onRemovePdf}
                  className="ml-1 rounded-full p-0.5 hover:bg-blue-100"
                >
                  <X className="h-3 w-3 text-blue-500" />
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {helperText ? <p className="mt-2 text-xs text-neutral-500">{helperText}</p> : null}
    </section>
  );
}
