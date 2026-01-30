'use client';

import { useEffect, useMemo, useState } from 'react';

import BaseModal from '@/components/common/BaseModal';
import { createEvent } from '@/lib/api/calendar';
import { toLocalDateTime } from '@/lib/datetime/seoul';

import type { InterviewStage, NotificationUnit } from '@/types/calendar';
import type { ChangeEvent, FormEvent } from 'react';

type CalendarEventCreateModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
};

type FormState = {
  stage: InterviewStage | '';
  title: string;
  company: string;
  startTime: string;
  endTime: string;
  description: string;
  tags: string;
  notificationTime: string;
  notificationUnit: NotificationUnit | '';
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const stageOptions: Array<{ value: InterviewStage; label: string }> = [
  { value: 'DOCUMENT', label: '서류' },
  { value: 'CODING_TEST', label: '코딩 테스트' },
  { value: 'INTERVIEW', label: '면접' },
];

const notificationUnitOptions: Array<{ value: NotificationUnit; label: string }> = [
  { value: 'MINUTE', label: '분' },
  { value: 'HOUR', label: '시간' },
  { value: 'DAY', label: '일' },
];

const initialFormState: FormState = {
  stage: '',
  title: '',
  company: '',
  startTime: '',
  endTime: '',
  description: '',
  tags: '',
  notificationTime: '',
  notificationUnit: '',
};

function normalizeLocalDateTimeInput(value: string) {
  if (!value) return value;
  // datetime-local은 "YYYY-MM-DDTHH:mm" 형태(초 없음)로 들어오니 초를 붙여 서버 스펙에 맞춤
  if (value.length === 16) return `${value}:00`;
  return value;
}

function parseTags(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const items = trimmed
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  return items.length > 0 ? items : null;
}

export default function CalendarEventCreateModal({
  open,
  onClose,
  onCreated,
}: CalendarEventCreateModalProps) {
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    // ✅ 모달이 열릴 때마다 폼을 초기화하려는 의도적인 setState.
    // 이 프로젝트의 eslint 규칙이 useEffect 내부 setState를 일괄 경고하므로, 이 케이스만 예외 처리.

    setFormState(initialFormState);
    setErrors({});
    setSubmitError(null);
    setSubmitting(false);
  }, [open]);

  const isSubmitDisabled = useMemo(() => {
    return formState.title.trim().length === 0 || formState.company.trim().length === 0;
  }, [formState.company, formState.title]);

  const handleChange =
    (field: keyof FormState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setFormState((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: FormErrors = {};

    if (!formState.stage) nextErrors.stage = '전형 단계를 선택해 주세요.';
    if (!formState.title.trim()) nextErrors.title = '제목을 입력해 주세요.';
    if (!formState.company.trim()) nextErrors.company = '회사를 입력해 주세요.';
    if (!formState.startTime) nextErrors.startTime = '시작 시간을 입력해 주세요.';
    if (!formState.endTime) nextErrors.endTime = '종료 시간을 입력해 주세요.';

    const normalizedStart = normalizeLocalDateTimeInput(formState.startTime);
    const normalizedEnd = normalizeLocalDateTimeInput(formState.endTime);

    if (normalizedStart && normalizedEnd && normalizedStart >= normalizedEnd) {
      nextErrors.endTime = '종료 시간은 시작 시간보다 이후여야 합니다.';
    }

    const notificationTimeValue = Number(formState.notificationTime);
    if (!formState.notificationTime) {
      nextErrors.notificationTime = '알림 시간을 입력해 주세요.';
    } else if (Number.isNaN(notificationTimeValue) || notificationTimeValue < 1) {
      nextErrors.notificationTime = '알림 시간은 1 이상이어야 합니다.';
    }

    if (!formState.notificationUnit) {
      nextErrors.notificationUnit = '알림 단위를 선택해 주세요.';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    setSubmitError(null);

    const toSeoulString = (value: string) =>
      toLocalDateTime(new Date(normalizeLocalDateTimeInput(value)));

    const payload = {
      stage: formState.stage as InterviewStage,
      title: formState.title.trim(),
      company: formState.company.trim(),
      startTime: toSeoulString(normalizedStart),
      endTime: toSeoulString(normalizedEnd),
      description: formState.description.trim() || null,
      tags: parseTags(formState.tags),
      notificationTime: notificationTimeValue,
      notificationUnit: formState.notificationUnit as NotificationUnit,
    };

    try {
      const result = await createEvent(payload);

      if (!result.ok) {
        setSubmitError(result.message ?? '일정 생성에 실패했습니다.');
        return;
      }

      onClose();
      onCreated?.();
    } catch {
      setSubmitError('일정 생성에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BaseModal open={open} onClose={onClose} title="일정 추가" contentClassName="max-w-[520px]">
      <form className="mt-4 space-y-4 text-sm" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-zinc-500">전형 단계</label>
          <select
            className="border-input bg-background h-9 rounded-md border px-3"
            value={formState.stage}
            onChange={handleChange('stage')}
          >
            <option value="">선택</option>
            {stageOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.stage && <p className="text-xs text-red-600">{errors.stage}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-zinc-500">제목</label>
          <input
            className="border-input bg-background h-9 rounded-md border px-3"
            value={formState.title}
            onChange={handleChange('title')}
            placeholder="예: 1차 면접"
          />
          {errors.title && <p className="text-xs text-red-600">{errors.title}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-zinc-500">회사</label>
          <input
            className="border-input bg-background h-9 rounded-md border px-3"
            value={formState.company}
            onChange={handleChange('company')}
            placeholder="예: Devths"
          />
          {errors.company && <p className="text-xs text-red-600">{errors.company}</p>}
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-zinc-500">시작 시간</label>
            <input
              type="datetime-local"
              className="border-input bg-background h-9 rounded-md border px-3"
              value={formState.startTime}
              onChange={handleChange('startTime')}
            />
            {errors.startTime && <p className="text-xs text-red-600">{errors.startTime}</p>}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-zinc-500">종료 시간</label>
            <input
              type="datetime-local"
              className="border-input bg-background h-9 rounded-md border px-3"
              value={formState.endTime}
              onChange={handleChange('endTime')}
            />
            {errors.endTime && <p className="text-xs text-red-600">{errors.endTime}</p>}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-zinc-500">설명</label>
          <textarea
            className="border-input bg-background min-h-[80px] rounded-md border px-3 py-2"
            value={formState.description}
            onChange={handleChange('description')}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-zinc-500">태그</label>
          <input
            className="border-input bg-background h-9 rounded-md border px-3"
            value={formState.tags}
            onChange={handleChange('tags')}
            placeholder="예: 프론트엔드, 인턴"
          />
          <p className="text-xs text-zinc-400">콤마(,)로 구분해 입력하세요.</p>
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_140px]">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-zinc-500">알림 시간</label>
            <input
              type="number"
              min={1}
              className="border-input bg-background h-9 rounded-md border px-3"
              value={formState.notificationTime}
              onChange={handleChange('notificationTime')}
            />
            {errors.notificationTime && (
              <p className="text-xs text-red-600">{errors.notificationTime}</p>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-zinc-500">알림 단위</label>
            <select
              className="border-input bg-background h-9 rounded-md border px-3"
              value={formState.notificationUnit}
              onChange={handleChange('notificationUnit')}
            >
              <option value="">선택</option>
              {notificationUnitOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.notificationUnit && (
              <p className="text-xs text-red-600">{errors.notificationUnit}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="border-input h-9 rounded-md border px-3 text-sm"
            onClick={onClose}
            disabled={submitting}
          >
            취소
          </button>
          <button
            type="submit"
            className="bg-primary text-primary-foreground h-9 rounded-md px-4 text-sm disabled:opacity-50"
            disabled={isSubmitDisabled || submitting}
          >
            {submitting ? '저장 중...' : '저장'}
          </button>
        </div>
        {submitError && <p className="text-xs text-red-600">{submitError}</p>}
      </form>
    </BaseModal>
  );
}
