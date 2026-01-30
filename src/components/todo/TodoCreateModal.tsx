'use client';

import { useEffect, useMemo, useState } from 'react';

import BaseModal from '@/components/common/BaseModal';
import { toLocalDate } from '@/lib/datetime/seoul';

import type { LocalDateString } from '@/types/calendar';

type TodoCreateModalProps = {
  open: boolean;
  onClose: () => void;
  defaultDueDate?: LocalDateString;
  onSubmit?: (payload: { title: string; dueDate: LocalDateString }) => void;
};

export default function TodoCreateModal({
  open,
  onClose,
  defaultDueDate,
  onSubmit,
}: TodoCreateModalProps) {
  const today = useMemo(() => toLocalDate(new Date()), []);
  const initialDueDate = defaultDueDate ?? today;

  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState<LocalDateString>(initialDueDate);

  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTitle('');
    setDueDate(initialDueDate);
  }, [initialDueDate, open]);

  const handleSubmit = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;
    onSubmit?.({ title: trimmedTitle, dueDate });
    onClose();
  };

  return (
    <BaseModal open={open} onClose={onClose} title="할 일 추가">
      <div className="mt-4 space-y-4">
        <div>
          <label className="mb-2 block text-xs font-medium text-neutral-500">할 일 제목</label>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="할 일을 입력하세요"
            className="h-12 w-full rounded-xl border border-neutral-300 px-4 text-sm focus:border-neutral-900 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium text-neutral-500">마감일</label>
          <input
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value as LocalDateString)}
            className="h-12 w-full rounded-xl border border-neutral-300 px-4 text-sm focus:border-neutral-900 focus:outline-none"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="h-12 flex-1 rounded-xl border border-neutral-300 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="h-12 flex-1 rounded-xl bg-neutral-900 text-sm font-semibold text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            추가
          </button>
        </div>
      </div>
    </BaseModal>
  );
}
