'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

import { cn } from '@/lib/utils';

import type { ReactNode } from 'react';

type BaseModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  contentClassName?: string;
  variant?: 'center' | 'sheet';
};

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function BaseModal({
  open,
  onClose,
  title,
  children,
  contentClassName,
  variant = 'center',
}: BaseModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<Element | null>(null);

  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement;

      const raf = requestAnimationFrame(() => {
        const firstFocusable = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE);
        firstFocusable?.focus();
      });

      return () => cancelAnimationFrame(raf);
    } else {
      if (triggerRef.current instanceof HTMLElement) {
        triggerRef.current.focus();
      }
      triggerRef.current = null;
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key !== 'Tab') return;

      const panel = panelRef.current;
      if (!panel) return;

      const focusables = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const baseClass =
    variant === 'sheet'
      ? 'fixed bottom-0 left-1/2 z-[51] w-full max-w-[430px] -translate-x-1/2 rounded-t-2xl bg-white p-5 shadow-lg'
      : 'fixed top-1/2 left-1/2 z-[51] w-[calc(100%-40px)] sm:w-[calc(100%-80px)] max-w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-5 shadow-lg';

  return createPortal(
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby={title ? 'base-modal-title' : undefined}>
      <button
        type="button"
        className="fixed inset-0 z-50 bg-black/50"
        onClick={onClose}
        aria-label="닫기"
        tabIndex={-1}
      />

      <div
        ref={panelRef}
        className={cn(
          baseClass,
          variant === 'sheet' ? 'max-h-[85vh] overflow-y-auto' : '',
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

        {title ? <h2 id="base-modal-title" className="text-base font-bold">{title}</h2> : null}
        <div className={title ? 'mt-2' : ''}>{children}</div>
      </div>
    </div>,
    document.body,
  );
}
