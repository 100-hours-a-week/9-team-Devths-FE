'use client';

import { Plus } from 'lucide-react';
import { useRef } from 'react';

import { cn } from '@/lib/utils';

const MAX_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png'] as const;

type ProfileImagePickerProps = {
  previewUrl?: string | null;

  onSelect: (file: File) => void;

  onFileTooLarge?: () => void;

  onInvalidType?: () => void;
};

export default function ProfileImagePicker({
  previewUrl,
  onSelect,
  onFileTooLarge,
  onInvalidType,
}: ProfileImagePickerProps) {
  const hasPreview = Boolean(previewUrl);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const openPicker = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    e.target.value = '';

    if (!file) return;

    const isAllowedType = (ALLOWED_MIME_TYPES as readonly string[]).includes(file.type);
    if (!isAllowedType) {
      onInvalidType?.();
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      onFileTooLarge?.();
      return;
    }

    onSelect(file);
  };

  return (
    <section className="flex flex-col items-center">
      <div className="text-sm font-semibold">프로필 사진</div>

      <button
        type="button"
        onClick={openPicker}
        className={cn(
          'relative mt-4 grid h-44 w-44 place-items-center overflow-hidden rounded-full shadow-sm transition',
          hasPreview ? 'bg-zinc-900 hover:bg-zinc-800' : 'bg-zinc-200 hover:bg-zinc-300',
        )}
        aria-label="프로필 사진 추가"
      >
        {hasPreview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl!}
            alt="프로필 사진 미리보기"
            className="h-full w-full object-cover"
          />
        ) : null}

        {hasPreview ? <span className="absolute inset-0 bg-black/50" /> : null}

        <span className="absolute inset-0 grid place-items-center">
          <span
            className={cn(
              'grid h-12 w-12 place-items-center rounded-full',
              hasPreview ? 'bg-black/30' : 'bg-white/60',
            )}
          >
            <Plus className={cn('h-6 w-6', hasPreview ? 'text-white' : 'text-zinc-700')} />
          </span>
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept=".jpg,.jpeg,.png,image/jpeg,image/png"
        onChange={handleChange}
      />
    </section>
  );
}
