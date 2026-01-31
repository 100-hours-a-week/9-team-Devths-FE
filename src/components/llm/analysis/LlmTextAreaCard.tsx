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
    <section className="py-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[15px] font-bold text-[#191F28]">{label}</h2>
        {headerRight}
      </div>

      <textarea
        className={[
          'mt-4 min-h-[120px] w-full resize-none rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3.5 text-[15px] leading-6 font-medium text-neutral-900 transition outline-none placeholder:text-neutral-400 focus:border-[#05C075] focus:ring-2 focus:ring-[#05C075]/20',
          textDisabled ? 'cursor-not-allowed opacity-50' : '',
        ].join(' ')}
        placeholder={
          textDisabled ? '파일이 첨부되어 텍스트 입력이 비활성화되었습니다' : placeholder
        }
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
              className="flex items-center gap-2 rounded-xl bg-[#00C473]/10 px-3 py-2"
            >
              <ImageIcon className="h-4 w-4 text-[#00C473]" />
              <span className="max-w-[120px] truncate text-[13px] font-medium text-[#191F28]">
                {file.name}
              </span>
              {onRemoveImage && (
                <button
                  type="button"
                  onClick={() => onRemoveImage(idx)}
                  className="ml-1 rounded-full p-0.5 active:bg-[#00C473]/20"
                >
                  <X className="h-3.5 w-3.5 text-[#8B95A1]" />
                </button>
              )}
            </div>
          ))}
          {attachments.pdf && (
            <div className="flex items-center gap-2 rounded-xl bg-[#00C473]/10 px-3 py-2">
              <FileText className="h-4 w-4 text-[#00C473]" />
              <span className="max-w-[120px] truncate text-[13px] font-medium text-[#191F28]">
                {attachments.pdf.name}
              </span>
              {onRemovePdf && (
                <button
                  type="button"
                  onClick={onRemovePdf}
                  className="ml-1 rounded-full p-0.5 active:bg-[#00C473]/20"
                >
                  <X className="h-3.5 w-3.5 text-[#8B95A1]" />
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {helperText ? <p className="mt-2 text-[13px] text-[#8B95A1]">{helperText}</p> : null}
    </section>
  );
}
