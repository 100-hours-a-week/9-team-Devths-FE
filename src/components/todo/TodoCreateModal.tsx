'use client';

import { useEffect, useMemo, useState } from 'react';

import BaseModal from '@/components/common/BaseModal';
import { getSeoulToday } from '@/lib/datetime/format';

import type { LocalDateString } from '@/types/calendar';

type TodoCreateModalProps = {
  open: boolean;
  onClose: () => void;
  defaultDueDate?: LocalDateString;
  onSubmit?: (payload: { title: string; dueDate: LocalDateString }) => Promise<
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

const TODO_TITLE_MAX_LENGTH = 50;

export default function TodoCreateModal({
  open,
  onClose,
  defaultDueDate,
  onSubmit,
}: TodoCreateModalProps) {
  const today = useMemo(() => getSeoulToday(), []);
  const initialDueDate = defaultDueDate ?? today;

  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState<LocalDateString>(initialDueDate);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    setTitle('');
    setDueDate(initialDueDate);
    setErrorMessage(null);
    setIsSubmitting(false);
  }, [initialDueDate, open]);

  const handleSubmit = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setErrorMessage('제목을 입력해 주세요');
      return;
    }

    if (!onSubmit) {
      onClose();
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await onSubmit({ title: trimmedTitle, dueDate });
      if (result && 'ok' in result && result.ok === false) {
        setErrorMessage(result.message ?? '추가에 실패했습니다.');
        return;
      }

      onClose();
    } catch {
      setErrorMessage('추가에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BaseModal open={open} onClose={onClose} contentClassName="p-6">
      <div className="space-y-5">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-[#05C075]">TODO</p>
          <h2 className="text-lg font-semibold text-black">할 일 추가</h2>
          <p className="text-xs text-black/40">오늘 해야 할 일을 간단히 적어보세요.</p>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold text-black/60">할 일 제목</label>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value.slice(0, TODO_TITLE_MAX_LENGTH))}
            maxLength={TODO_TITLE_MAX_LENGTH}
            placeholder="할 일을 입력하세요"
            className="h-12 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm text-black placeholder:text-black/30 focus:border-black focus:ring-2 focus:ring-[#05C075]/20 focus:outline-none"
          />
          <div className="mt-1 text-right text-[11px] text-black/40">
            {title.length}/{TODO_TITLE_MAX_LENGTH}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold text-black/60">마감일</label>
          <input
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value as LocalDateString)}
            className="h-12 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm text-black/80 focus:border-black focus:ring-2 focus:ring-[#05C075]/20 focus:outline-none"
          />
        </div>

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="h-12 flex-1 rounded-2xl border border-black/10 text-sm font-semibold text-black/70 hover:bg-black/[0.04]"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!title.trim() || isSubmitting}
            className="h-12 flex-1 rounded-2xl bg-[#05C075] text-sm font-semibold text-white shadow-sm shadow-[#05C075]/30 transition hover:bg-[#04A865] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? '추가 중...' : '추가'}
          </button>
        </div>

        {errorMessage ? <p className="text-center text-xs text-red-500">{errorMessage}</p> : null}
      </div>
    </BaseModal>
  );
}
