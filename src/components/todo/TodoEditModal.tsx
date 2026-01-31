'use client';

import { useEffect, useMemo, useState } from 'react';

import BaseModal from '@/components/common/BaseModal';
import { getSeoulToday } from '@/lib/datetime/format';

import type { LocalDateString } from '@/types/calendar';
import type { Todo } from '@/types/todo';

type TodoEditModalProps = {
  open: boolean;
  onClose: () => void;
  todo: Todo | null;
  onSubmit?: (payload: { todoId: string; title: string; dueDate: LocalDateString }) => Promise<
    | {
        ok: true;
      }
    | {
        ok: false;
        message?: string;
      }
    | void
  >;
};

export default function TodoEditModal({ open, onClose, todo, onSubmit }: TodoEditModalProps) {
  const today = useMemo(() => getSeoulToday(), []);
  const initialTitle = todo?.title ?? '';
  const initialDueDate = (todo?.dueDate ?? today) as LocalDateString;

  const [title, setTitle] = useState(initialTitle);
  const [dueDate, setDueDate] = useState<LocalDateString>(initialDueDate);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    const syncId = window.setTimeout(() => {
      setTitle(initialTitle);
      setDueDate(initialDueDate);
      setErrorMessage(null);
      setIsSubmitting(false);
    }, 0);
    return () => window.clearTimeout(syncId);
  }, [initialDueDate, initialTitle, open]);

  const handleSubmit = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setErrorMessage('제목을 입력해 주세요');
      return;
    }

    if (!todo || !onSubmit) {
      onClose();
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await onSubmit({ todoId: todo.todoId, title: trimmedTitle, dueDate });
      if (result && 'ok' in result && result.ok === false) {
        setErrorMessage(result.message ?? '수정에 실패했습니다.');
        return;
      }

      onClose();
    } catch {
      setErrorMessage('수정에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BaseModal open={open} onClose={onClose} title="할 일 수정">
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
            disabled={!title.trim() || isSubmitting}
            className="h-12 flex-1 rounded-xl bg-neutral-900 text-sm font-semibold text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? '수정 중...' : '수정'}
          </button>
        </div>

        {errorMessage ? <p className="text-center text-xs text-red-500">{errorMessage}</p> : null}
      </div>
    </BaseModal>
  );
}
