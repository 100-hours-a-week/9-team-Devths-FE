'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import BaseModal from '@/components/common/BaseModal';

import type { BoardAttachment } from '@/types/boardCreate';

type MaskRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type BoardPdfMaskModalProps = {
  attachment: BoardAttachment;
  onClose: () => void;
  onComplete: (file: File, previewUrl: string) => void;
};

const MIN_RECT_SIZE = 6;

export default function BoardPdfMaskModal({
  attachment,
  onClose,
  onComplete,
}: BoardPdfMaskModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pageImagesRef = useRef<Map<number, ImageBitmap>>(new Map());
  const pageMasksRef = useRef<Map<number, MaskRect[]>>(new Map());
  const startPointRef = useRef<{ x: number; y: number } | null>(null);
  const currentRectRef = useRef<MaskRect | null>(null);
  const viewportRef = useRef<{ width: number; height: number; scale: number } | null>(null);

  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [maskCountPerPage, setMaskCountPerPage] = useState<Map<number, number>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  // Load PDF and render current page
  useEffect(() => {
    let cancelled = false;

    const loadPdf = async () => {
      setIsLoading(true);
      const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist');
      GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

      let objectUrl: string | null = null;
      let src: string;
      if (attachment.previewUrl && !attachment.previewUrl.startsWith('blob:')) {
        src = `/api/image-proxy?url=${encodeURIComponent(attachment.previewUrl)}`;
      } else if (attachment.previewUrl) {
        src = attachment.previewUrl;
      } else {
        objectUrl = URL.createObjectURL(attachment.file);
        src = objectUrl;
      }

      const pdf = await getDocument(src).promise;
      if (cancelled) {
        if (objectUrl) URL.revokeObjectURL(objectUrl);
        return;
      }

      setTotalPages(pdf.numPages);

      // Pre-render all pages to ImageBitmap
      const renderPage = async (pageNum: number) => {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.5 });
        const offscreen = document.createElement('canvas');
        offscreen.width = viewport.width;
        offscreen.height = viewport.height;
        const ctx = offscreen.getContext('2d')!;
        await page.render({ canvasContext: ctx, viewport, canvas: offscreen }).promise;
        const bitmap = await createImageBitmap(offscreen);
        return { pageNum, bitmap, viewport };
      };

      const results = await Promise.all(
        Array.from({ length: pdf.numPages }, (_, i) => renderPage(i + 1)),
      );

      if (cancelled) {
        if (objectUrl) URL.revokeObjectURL(objectUrl);
        return;
      }

      results.forEach(({ pageNum, bitmap }) => {
        pageImagesRef.current.set(pageNum, bitmap);
      });

      // Store viewport of page 1 as reference (all pages share same scale)
      if (results[0]) {
        viewportRef.current = {
          width: results[0].viewport.width,
          height: results[0].viewport.height,
          scale: 1.5,
        };
      }

      if (objectUrl) URL.revokeObjectURL(objectUrl);
      setIsLoading(false);
    };

    void loadPdf().catch(() => setIsLoading(false));

    return () => {
      cancelled = true;
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const pageImages = pageImagesRef.current;
      pageImages.forEach((bitmap) => bitmap.close());
      pageImages.clear();
    };
  }, [attachment]);

  const redraw = useCallback((page: number, previewRect?: MaskRect | null) => {
    const canvas = canvasRef.current;
    const bitmap = pageImagesRef.current.get(page);
    if (!canvas || !bitmap) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    ctx.drawImage(bitmap, 0, 0);

    const masks = pageMasksRef.current.get(page) ?? [];
    masks.forEach((rect) => {
      ctx.fillStyle = 'black';
      ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
    });

    if (previewRect) {
      ctx.save();
      ctx.strokeStyle = '#05C075';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(previewRect.x, previewRect.y, previewRect.width, previewRect.height);
      ctx.restore();
    }
  }, []);

  // Redraw when page changes or loading finishes
  useEffect(() => {
    if (!isLoading) {
      redraw(currentPage);
    }
  }, [currentPage, isLoading, redraw]);

  const getCanvasCoords = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  };

  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(event);
    if (!coords) return;
    startPointRef.current = coords;
    currentRectRef.current = { x: coords.x, y: coords.y, width: 0, height: 0 };
  }, []);

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      if (!startPointRef.current) return;
      const coords = getCanvasCoords(event);
      if (!coords) return;
      const start = startPointRef.current;
      const rect: MaskRect = {
        x: Math.min(start.x, coords.x),
        y: Math.min(start.y, coords.y),
        width: Math.abs(coords.x - start.x),
        height: Math.abs(coords.y - start.y),
      };
      currentRectRef.current = rect;
      redraw(currentPage, rect);
    },
    [currentPage, redraw],
  );

  const finalizeRect = useCallback(() => {
    const rect = currentRectRef.current;
    if (!rect || rect.width < MIN_RECT_SIZE || rect.height < MIN_RECT_SIZE) {
      currentRectRef.current = null;
      startPointRef.current = null;
      redraw(currentPage);
      return;
    }
    const prev = pageMasksRef.current.get(currentPage) ?? [];
    pageMasksRef.current.set(currentPage, [...prev, rect]);
    currentRectRef.current = null;
    startPointRef.current = null;
    setMaskCountPerPage((m) => {
      const next = new Map(m);
      next.set(currentPage, (next.get(currentPage) ?? 0) + 1);
      return next;
    });
    redraw(currentPage);
  }, [currentPage, redraw]);

  const handlePointerUp = useCallback(() => {
    finalizeRect();
  }, [finalizeRect]);

  const handlePointerLeave = useCallback(() => {
    finalizeRect();
  }, [finalizeRect]);

  const handleReset = useCallback(() => {
    pageMasksRef.current.set(currentPage, []);
    currentRectRef.current = null;
    startPointRef.current = null;
    setMaskCountPerPage((m) => {
      const next = new Map(m);
      next.set(currentPage, 0);
      return next;
    });
    redraw(currentPage);
  }, [currentPage, redraw]);

  const handleComplete = useCallback(async () => {
    const { PDFDocument, rgb } = await import('pdf-lib');

    let arrayBuffer: ArrayBuffer;
    if (attachment.previewUrl && !attachment.previewUrl.startsWith('blob:')) {
      const res = await fetch(`/api/image-proxy?url=${encodeURIComponent(attachment.previewUrl)}`);
      arrayBuffer = await res.arrayBuffer();
    } else if (attachment.previewUrl) {
      const res = await fetch(attachment.previewUrl);
      arrayBuffer = await res.arrayBuffer();
    } else {
      arrayBuffer = await attachment.file.arrayBuffer();
    }
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();

    pageMasksRef.current.forEach((masks, pageNum) => {
      if (masks.length === 0) return;
      const page = pages[pageNum - 1];
      if (!page) return;

      const bitmap = pageImagesRef.current.get(pageNum);
      if (!bitmap) return;

      const pdfWidth = page.getWidth();
      const pdfHeight = page.getHeight();
      const canvasWidth = bitmap.width;
      const canvasHeight = bitmap.height;

      masks.forEach((rect) => {
        // Map canvas coords → PDF coords (y-flip)
        const pdfX = (rect.x / canvasWidth) * pdfWidth;
        const pdfY = pdfHeight - ((rect.y + rect.height) / canvasHeight) * pdfHeight;
        const pdfW = (rect.width / canvasWidth) * pdfWidth;
        const pdfH = (rect.height / canvasHeight) * pdfHeight;

        page.drawRectangle({
          x: pdfX,
          y: pdfY,
          width: pdfW,
          height: pdfH,
          color: rgb(0, 0, 0),
        });
      });
    });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
    const fileName = attachment.name.endsWith('.pdf')
      ? attachment.name
      : `${attachment.name.replace(/\.[^/.]+$/, '')}.pdf`;
    const file = new File([blob], fileName, { type: 'application/pdf' });
    const previewUrl = URL.createObjectURL(file);
    onComplete(file, previewUrl);
  }, [attachment, onComplete]);

  const totalMaskCount = Array.from(maskCountPerPage.values()).reduce((a, b) => a + b, 0);

  return (
    <BaseModal open onClose={onClose} title="개인정보 가리기" contentClassName="space-y-4">
      <p className="text-xs text-neutral-500">
        마스킹할 영역을 드래그해 주세요. 페이지별로 여러 영역을 선택할 수 있습니다.
      </p>

      {isLoading ? (
        <div className="flex h-[200px] items-center justify-center rounded-2xl border border-dashed border-neutral-200 bg-neutral-50">
          <p className="text-sm text-neutral-400">PDF 불러오는 중...</p>
        </div>
      ) : (
        <>
          {totalPages > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                const count = maskCountPerPage.get(page) ?? 0;
                const isActive = page === currentPage;
                return (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`relative flex h-8 min-w-[32px] items-center justify-center rounded-full px-2 text-xs font-semibold ${
                      isActive
                        ? 'bg-[#05C075] text-white'
                        : 'border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    {page}
                    {count > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 p-3">
            <canvas
              ref={canvasRef}
              className="max-h-[360px] w-full touch-none rounded-xl bg-white"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerLeave}
            />
          </div>

          {totalPages > 1 && (
            <p className="text-center text-xs text-neutral-400">
              {currentPage} / {totalPages} 페이지
              {totalMaskCount > 0 ? ` · 전체 ${totalMaskCount}개 마스킹` : ''}
            </p>
          )}
        </>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleReset}
          disabled={isLoading}
          className="flex-1 rounded-full border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
        >
          초기화
        </button>
        <button
          type="button"
          onClick={handleComplete}
          disabled={isLoading}
          className="flex-1 rounded-full bg-[#05C075] px-3 py-2 text-sm font-semibold text-white shadow-sm shadow-[#05C075]/30 hover:bg-[#04A865] disabled:opacity-50"
        >
          완료
        </button>
      </div>
    </BaseModal>
  );
}
