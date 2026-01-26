'use client';

import type { ClipboardEvent, ReactNode } from 'react';

type Props = {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  onPasteBlocked?: () => void;
  helperText?: string;
  headerRight?: ReactNode;
};

export default function LlmTextAreaCard({
  label,
  placeholder,
  value,
  onChange,
  onPasteBlocked,
  helperText,
  headerRight,
}: Props) {
  const handlePaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const files = e.clipboardData?.files;
    if (files && files.length > 0) {
      e.preventDefault();
      onPasteBlocked?.();
    }
  };

  return (
    <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-neutral-900">{label}</h2>
        {headerRight}
      </div>

      <textarea
        className="mt-3 min-h-[140px] w-full resize-none rounded-2xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm outline-none focus:border-neutral-400"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onPaste={handlePaste}
      />

      {helperText ? <p className="mt-2 text-xs text-neutral-500">{helperText}</p> : null}
    </section>
  );
}
