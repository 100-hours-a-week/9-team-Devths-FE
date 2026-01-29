'use client';

import { createPortal } from 'react-dom';

import { cn } from '@/lib/utils';

import type { ReactNode } from 'react';

type BaseModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  contentClassName?: string;
};

export default function BaseModal({
  open,
  onClose,
  title,
  children,
  contentClassName,
}: BaseModalProps) {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="fixed inset-0 z-50 bg-black/50"
        onClick={onClose}
        aria-label="닫기"
      />

      <div
        className={cn(
          'fixed left-1/2 top-1/2 z-[51] w-[calc(100%-40px)] max-w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-5 shadow-lg',
          contentClassName,
        )}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-700"
          aria-label="닫기"
        >
          ✕
        </button>

        {title ? <h2 className="text-base font-bold">{title}</h2> : null}
        <div className={title ? 'mt-2' : ''}>{children}</div>
      </div>
    </div>,
    document.body,
  );
}
