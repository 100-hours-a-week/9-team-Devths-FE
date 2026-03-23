'use client';

import { useCallback, useEffect, useRef } from 'react';

const IMAGE_MAX_PX = 1920;
const IMAGE_QUALITY = 0.85;

type CompressOptions = {
  maxPx?: number;
  quality?: number;
};

type PendingEntry = {
  resolve: (blob: Blob) => void;
  reject: (err: Error) => void;
};

async function compressOnMainThread(file: File, maxPx: number, quality: number): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const { width, height } = img;
      const scale = Math.min(maxPx / width, maxPx / height, 1);
      const w = Math.round(width * scale);
      const h = Math.round(height * scale);

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context를 생성할 수 없습니다.'));
        return;
      }

      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('이미지 변환에 실패했습니다.'));
            return;
          }
          const outputName = file.name.replace(/\.[^.]+$/, '.webp');
          resolve(new File([blob], outputName, { type: 'image/webp' }));
        },
        'image/webp',
        quality,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('이미지를 로드할 수 없습니다.'));
    };

    img.src = objectUrl;
  });
}

export function useImageProcessor() {
  const workerRef = useRef<Worker | null>(null);
  const pendingRef = useRef<Map<string, PendingEntry>>(new Map());
  const supportsOffscreenCanvas = typeof OffscreenCanvas !== 'undefined';

  useEffect(() => {
    if (!supportsOffscreenCanvas) return;

    const worker = new Worker(new URL('../workers/imageProcessor.worker.ts', import.meta.url));
    workerRef.current = worker;

    worker.onmessage = (event: MessageEvent<{ id: string; blob?: Blob; error?: string }>) => {
      const { id, blob, error } = event.data;
      const pending = pendingRef.current.get(id);
      if (!pending) return;
      pendingRef.current.delete(id);
      if (error || !blob) {
        pending.reject(new Error(error ?? '이미지 압축에 실패했습니다.'));
      } else {
        pending.resolve(blob);
      }
    };

    worker.onerror = (event) => {
      for (const { reject } of pendingRef.current.values()) {
        reject(new Error(event.message));
      }
      pendingRef.current.clear();
    };

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, [supportsOffscreenCanvas]);

  const compress = useCallback(
    async (file: File, options: CompressOptions = {}): Promise<File> => {
      const maxPx = options.maxPx ?? IMAGE_MAX_PX;
      const quality = options.quality ?? IMAGE_QUALITY;
      const outputName = file.name.replace(/\.[^.]+$/, '.webp');

      if (!supportsOffscreenCanvas || !workerRef.current) {
        return compressOnMainThread(file, maxPx, quality);
      }

      const bitmap = await createImageBitmap(file);
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

      return new Promise<File>((resolve, reject) => {
        pendingRef.current.set(id, {
          resolve: (blob) => resolve(new File([blob], outputName, { type: 'image/webp' })),
          reject,
        });
        workerRef.current!.postMessage({ id, bitmap, maxPx, quality }, [bitmap]);
      });
    },
    [supportsOffscreenCanvas],
  );

  return { compress };
}
