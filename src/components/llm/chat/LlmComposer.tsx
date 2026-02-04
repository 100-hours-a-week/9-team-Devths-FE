'use client';

import { FileText, SendHorizonal, X } from 'lucide-react';
import Image from 'next/image';
import { type ClipboardEvent, useMemo, useRef, useState } from 'react';

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

const CHAT_MESSAGE_MAX_LENGTH = 2000;

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
  const isComposingRef = useRef(false);
  const [isMobile] = useState(() => {
    if (typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod|android|mobile/.test(ua);
  });

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
      toast('첨부파일 기능은 다음 버전에서 업데이트될 예정이에요!');
    }
  };

  const handleSend = () => {
    if (!canSend || isComposingRef.current) return;
    const message = text.trim();
    onSend?.(message);
    setText('');
  };

  const handleDisabledInputClick = () => {
    if (!disabled) return;
    toast('AI 답변 생성 중에는 채팅을 입력할 수 없습니다');
  };

  return (
    <div className="border-t border-neutral-200 bg-white px-3 py-2">
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
            <div className="group relative flex h-16 items-center gap-2 rounded-lg border border-[#05C075]/30 bg-[#05C075]/10 px-3">
              <FileText className="h-5 w-5 text-[#05C075]" />
              <span className="max-w-[100px] truncate text-xs text-neutral-800">
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
        <div className="flex-1" onMouseDown={handleDisabledInputClick}>
          <textarea
            className={[
              'h-11 w-full resize-none rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-900 transition outline-none placeholder:text-neutral-400 focus:border-[#05C075] focus:ring-2 focus:ring-[#05C075]/20',
              disabled ? 'bg-neutral-100 text-neutral-400' : '',
            ].join(' ')}
            placeholder="메시지를 입력하세요"
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, CHAT_MESSAGE_MAX_LENGTH))}
            maxLength={CHAT_MESSAGE_MAX_LENGTH}
            onPaste={handlePaste}
            disabled={disabled}
            onCompositionStart={() => {
              isComposingRef.current = true;
            }}
            onCompositionEnd={() => {
              isComposingRef.current = false;
            }}
            onKeyDown={(e) => {
              const isComposing =
                isComposingRef.current || (e.nativeEvent as KeyboardEvent).isComposing;
              if (isComposing) return;
              if (!isMobile && e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
        </div>

        <button
          type="button"
          disabled={!canSend}
          onClick={handleSend}
          className={[
            'inline-flex h-11 w-11 items-center justify-center rounded-2xl transition',
            canSend
              ? 'bg-[#05C075] text-white hover:bg-[#049e61]'
              : 'bg-neutral-200 text-neutral-500',
          ].join(' ')}
          aria-label="전송"
        >
          <SendHorizonal className="h-5 w-5" />
        </button>
      </div>
      <div className="mt-1 text-right text-[11px] text-neutral-400">
        {text.length}/{CHAT_MESSAGE_MAX_LENGTH}
      </div>
    </div>
  );
}
