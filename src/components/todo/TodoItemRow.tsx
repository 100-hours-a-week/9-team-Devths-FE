'use client';

import { useState } from 'react';

import { cn } from '@/lib/utils';

type TodoItemRowProps = {
  todoId: string;
  title: string;
  isCompleted: boolean;
  onToggle?: (todoId: string) => void;
  onClick?: (todoId: string) => void;
  onEdit?: (todoId: string) => void;
  onDelete?: (todoId: string) => void;
  meta?: string;
};

export default function TodoItemRow({
  todoId,
  title,
  isCompleted,
  onToggle,
  onClick,
  onEdit,
  onDelete,
  meta,
}: TodoItemRowProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="relative flex w-full items-center gap-3 rounded-lg border border-neutral-200 bg-white px-3 py-2">
      <button
        type="button"
        onClick={() => onToggle?.(todoId)}
        role="checkbox"
        aria-checked={isCompleted}
        className={cn(
          'flex h-5 w-5 items-center justify-center rounded-full border transition-colors',
          isCompleted
            ? 'border-neutral-300 bg-neutral-300 text-white'
            : 'border-neutral-300 bg-white text-transparent',
        )}
      >
        <span className={cn('text-[11px] font-bold', isCompleted ? 'opacity-100' : 'opacity-0')}>
          ✓
        </span>
      </button>
      <button
        type="button"
        onClick={() => onClick?.(todoId)}
        className={cn(
          'min-w-0 flex-1 text-left text-sm transition-colors',
          isCompleted ? 'text-neutral-400 line-through' : 'text-neutral-900',
        )}
      >
        <span className="flex items-center gap-2">
          <span className="truncate">{title}</span>
          {meta ? <span className="text-xs text-neutral-400">{meta}</span> : null}
        </span>
      </button>

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-label="메뉴"
          aria-expanded={isMenuOpen}
          className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
        >
          ⋯
        </button>

        {isMenuOpen ? (
          <div className="absolute right-0 top-full z-20 -mt-1 w-24 rounded-lg border border-neutral-200 bg-white py-1 text-sm shadow-md">
            <button
              type="button"
              onClick={() => {
                onEdit?.(todoId);
                setIsMenuOpen(false);
              }}
              className="w-full px-3 py-2 text-left text-neutral-700 hover:bg-neutral-50"
            >
              수정
            </button>
            <button
              type="button"
              onClick={() => {
                onDelete?.(todoId);
                setIsMenuOpen(false);
              }}
              className="w-full px-3 py-2 text-left text-red-500 hover:bg-red-50"
            >
              삭제
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
