'use client';

import { Minus, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';

import BaseModal from '@/components/common/BaseModal';
import type { BoardAttachment } from '@/types/boardCreate';

type BoardAttachmentPreviewModalProps = {
  open: boolean;
  onClose: () => void;
  attachment: BoardAttachment | null;
};

const MIN_ZOOM = 50;
const MAX_ZOOM = 300;
const STEP = 10;

export default function BoardAttachmentPreviewModal({
  open,
  onClose,
  attachment,
}: BoardAttachmentPreviewModalProps) {
  if (!attachment) return null;

  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    if (open) {
      setZoom(100);
    }
  }, [open]);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(MAX_ZOOM, prev + STEP));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(MIN_ZOOM, prev - STEP));
  };

  return (
    <BaseModal open={open} onClose={onClose} title="미리보기" contentClassName="pb-16">
      <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-dashed border-neutral-200 bg-neutral-50 text-xs text-neutral-400">
        {attachment.type === 'PDF' ? 'PDF 미리보기' : '이미지 미리보기'}
      </div>

      <div className="mt-4 flex items-center justify-center gap-3 rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs text-neutral-700">
        <button
          type="button"
          onClick={handleZoomOut}
          disabled={zoom <= MIN_ZOOM}
          className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 disabled:opacity-40"
          aria-label="축소"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span>{zoom}%</span>
        <button
          type="button"
          onClick={handleZoomIn}
          disabled={zoom >= MAX_ZOOM}
          className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 disabled:opacity-40"
          aria-label="확대"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </BaseModal>
  );
}
