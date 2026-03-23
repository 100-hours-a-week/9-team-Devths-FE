type CompressRequest = {
  id: string;
  bitmap: ImageBitmap;
  maxPx: number;
  quality: number;
};

type CompressResponse = { id: string; blob: Blob } | { id: string; error: string };

self.onmessage = async (event: MessageEvent<CompressRequest>) => {
  const { id, bitmap, maxPx, quality } = event.data ?? {};
  if (
    typeof id !== 'string' ||
    !(bitmap instanceof ImageBitmap) ||
    typeof maxPx !== 'number' ||
    typeof quality !== 'number'
  ) {
    return;
  }

  try {
    const { width, height } = bitmap;
    const scale = Math.min(maxPx / width, maxPx / height, 1);
    const w = Math.round(width * scale);
    const h = Math.round(height * scale);

    const canvas = new OffscreenCanvas(w, h);
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      bitmap.close();
      self.postMessage({
        id,
        error: 'OffscreenCanvas context를 생성할 수 없습니다.',
      } satisfies CompressResponse);
      return;
    }

    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();

    const blob = await canvas.convertToBlob({ type: 'image/webp', quality });
    self.postMessage({ id, blob } satisfies CompressResponse);
  } catch (err) {
    bitmap.close();
    self.postMessage({ id, error: String(err) } satisfies CompressResponse);
  }
};
