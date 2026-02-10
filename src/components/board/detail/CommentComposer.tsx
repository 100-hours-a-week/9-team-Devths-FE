'use client';

import { useState } from 'react';

import { cn } from '@/lib/utils';

type CommentComposerProps = {
  onSubmit?: (content: string) => void | Promise<void> | boolean;
  placeholder?: string;
  className?: string;
  maxLength?: number;
  isSubmitting?: boolean;
};

export default function CommentComposer({
  onSubmit,
  placeholder = '댓글을 입력하세요...',
  className,
  maxLength = 500,
  isSubmitting = false,
}: CommentComposerProps) {
  const [value, setValue] = useState('');
  const trimmed = value.trim();
  const isDisabled = trimmed.length === 0 || isSubmitting;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isDisabled) return;

    const result = await Promise.resolve(onSubmit?.(trimmed));
    if (result === false) return;

    setValue('');
  };

  return (
    <form onSubmit={handleSubmit} className={cn('flex items-center gap-2', className)}>
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={isSubmitting}
        className="flex-1 rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs text-neutral-700 placeholder:text-neutral-400 focus:border-[#05C075] focus:outline-none"
        aria-label="댓글 입력"
      />
      <button
        type="submit"
        disabled={isDisabled}
        className="rounded-full bg-neutral-200 px-4 py-2 text-xs font-semibold text-neutral-500 enabled:bg-[#05C075] enabled:text-white hover:enabled:bg-[#04A865] disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400"
      >
        {isSubmitting ? '등록 중' : '등록'}
      </button>
    </form>
  );
}
