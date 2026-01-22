'use client';

import { Plus } from 'lucide-react';

import { cn } from '@/lib/utils';

type ProfileImagePickerProps = {
  previewUrl?: string | null;
  onClickAdd?: () => void;
};

export default function ProfileImagePicker({ previewUrl, onClickAdd }: ProfileImagePickerProps) {
  const hasPreview = Boolean(previewUrl);

  return (
    <section className="flex flex-col items-center">
      <div className="text-sm font-semibold">프로필 사진</div>

      <button
        type="button"
        onClick={onClickAdd}
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

        {/* + 아이콘(등록 전에는 그냥 보이고, 등록 후에는 살짝 오버레이처럼) */}
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
    </section>
  );
}
