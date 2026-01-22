'use client';

import { useToastStore } from '@/lib/toast/store';

export default function ToastHost() {
  const toasts = useToastStore((s) => s.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-50 w-[calc(100%-40px)] max-w-[420px] -translate-x-1/2 space-y-2">
      {toasts.map((t) => (
        <div key={t.id} className="rounded-2xl bg-zinc-900 px-4 py-3 text-sm text-white shadow-lg">
          {t.message}
        </div>
      ))}
    </div>
  );
}
