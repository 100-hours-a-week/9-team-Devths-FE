'use client';

import { FileText, SendHorizonal, X } from 'lucide-react';
import Image from 'next/image';
import { type ClipboardEvent, useEffect, useMemo, useState } from 'react';

import { toast } from '@/lib/toast/store';

type Props = {
  onSend?: (text: string) => void;
  disabled?: boolean;
  onAttach?: () => void;
  attachedImages?: File[];
  attachedPdf?: File | null;
  onRemoveImage?: (index: number) => void;
  onRemovePdf?: () => void;
};

export default function LlmComposer(props: Props) {
  const {
    onSend,
    disabled = false,
    attachedImages = [],
    attachedPdf,
    onRemoveImage,
    onRemovePdf,
  } = props;
  const [text, setText] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof navigator === 'undefined') return;
    const ua = navigator.userAgent.toLowerCase();
    setIsMobile(/iphone|ipad|ipod|android|mobile/.test(ua));
  }, []);

  const hasAttachments = attachedImages.length > 0 || attachedPdf !== null;
  const canSend = (text.trim().length > 0 || hasAttachments) && !disabled;

  const imagePreviewUrls = useMemo(
    () => attachedImages.map((file) => URL.createObjectURL(file)),
    [attachedImages],
  );

  const handlePaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const files = e.clipboardData?.files;
    if (files && files.length > 0) {
      e.preventDefault();
      toast('이미지/파일은 첨부 버튼으로만 업로드할 수 있어요.');
    }
  };

  const handleSend = () => {
    if (!canSend) return;
    onSend?.(text.trim());
    setText('');
  };

  return (
    <div className="border-t bg-white px-3 py-2">
      {hasAttachments && (
        <div className="mb-2 flex flex-wrap gap-2">
          {imagePreviewUrls.map((url, index) => (
            <div key={url} className="group relative">
              <Image
                src={url}
                alt={`첨부 이미지 ${index + 1}`}
                width={64}
                height={64}
                className="h-16 w-16 rounded-lg border border-neutral-200 object-cover"
              />
              <button
                type="button"
                onClick={() => onRemoveImage?.(index)}
                className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 text-white opacity-0 transition group-hover:opacity-100"
                aria-label="이미지 삭제"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {attachedPdf && (
            <div className="group relative flex h-16 items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3">
              <FileText className="h-5 w-5 text-blue-600" />
              <span className="max-w-[100px] truncate text-xs text-blue-800">
                {attachedPdf.name}
              </span>
              <button
                type="button"
                onClick={onRemovePdf}
                className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 text-white opacity-0 transition group-hover:opacity-100"
                aria-label="PDF 삭제"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      )}

      <div className="flex items-end gap-2">
        {/*
        <button
          type="button"
          onClick={props.onAttach}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-neutral-200 bg-white text-neutral-700 shadow-sm hover:bg-neutral-50"
          aria-label="파일 첨부"
        >
          <Paperclip className="h-5 w-5" />
        </button>
        */}
        <textarea
          className="h-11 flex-1 resize-none rounded-2xl border bg-neutral-50 px-3 py-2 text-sm outline-none focus:border-neutral-400"
          placeholder="메시지를 입력하세요"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onPaste={handlePaste}
          onKeyDown={(e) => {
            if (!isMobile && e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />

        <button
          type="button"
          disabled={!canSend}
          onClick={handleSend}
          className={[
            'inline-flex h-11 w-11 items-center justify-center rounded-2xl transition',
            canSend
              ? 'bg-neutral-900 text-white hover:bg-neutral-800'
              : 'bg-neutral-200 text-neutral-500',
          ].join(' ')}
          aria-label="전송"
        >
          <SendHorizonal className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
