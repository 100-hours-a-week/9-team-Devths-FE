'use client';

import type { ReactNode } from 'react';

type BaseModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
};

export default function BaseModal({ open, onClose, title, children }: BaseModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-label="닫기"
      />

      <div className="absolute top-1/2 left-1/2 w-[calc(100%-40px)] max-w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-5 shadow-lg">
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
    </div>
  );
}
