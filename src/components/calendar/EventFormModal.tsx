'use client';

import { useEffect, useMemo, useState } from 'react';

import BaseModal from '@/components/common/BaseModal';

import type {
  GoogleEventCreateRequest,
  GoogleEventDetailResponse,
  InterviewStage,
  NotificationUnit,
} from '@/types/calendar';
import type { ChangeEvent, FormEvent } from 'react';

export type EventFormMode = 'create' | 'edit';

type EventFormModalProps = {
  open: boolean;
  mode: EventFormMode;
  detail?: GoogleEventDetailResponse | null;
  onClose: () => void;
  onSubmit: (payload: GoogleEventCreateRequest) => Promise<void> | void;
  submitting?: boolean;
  submitError?: string | null;
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

const emptyFormState: FormState = {
  stage: '',
  title: '',
  company: '',
  startTime: '',
  endTime: '',
  description: '',
  tags: '',
  notificationTime: '',
  notificationUnit: 'MINUTE',
};

function normalizeLocalDateTimeInput(value: string) {
  if (!value) return value;
  if (value.length === 16) return `${value}:00`;
  return value;
}

function toInputValue(value: string) {
  if (!value) return '';
  return value.slice(0, 16);
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

export default function EventFormModal({
  open,
  mode,
  detail,
  onClose,
  onSubmit,
  submitting = false,
  submitError,
}: EventFormModalProps) {
  const [formState, setFormState] = useState<FormState>(emptyFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [modeError, setModeError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    if (mode === 'edit') {
      if (!detail) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFormState(emptyFormState);
        setErrors({});
        setModeError('일정 정보를 불러올 수 없습니다.');
        return;
      }

      const nextState: FormState = {
        stage: detail.stage,
        title: detail.title,
        company: detail.company,
        startTime: toInputValue(detail.startTime),
        endTime: toInputValue(detail.endTime),
        description: detail.description ?? '',
        tags: detail.tags.join(', '),
        notificationTime: detail.notificationTime?.toString() ?? '',
        notificationUnit: detail.notificationTime ? detail.notificationUnit : 'MINUTE',
      };

      setFormState(nextState);
      setErrors({});
      setModeError(null);
      return;
    }

    setFormState(emptyFormState);
    setErrors({});
    setModeError(null);
  }, [detail, mode, open]);

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

    if (mode === 'edit' && !detail) {
      setModeError('일정 정보를 불러올 수 없습니다.');
      return;
    }

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

    const payload: GoogleEventCreateRequest = {
      stage: formState.stage as InterviewStage,
      title: formState.title.trim(),
      company: formState.company.trim(),
      startTime: normalizedStart,
      endTime: normalizedEnd,
      description: formState.description.trim() || null,
      tags: parseTags(formState.tags),
      notificationTime: notificationTimeValue,
      notificationUnit: formState.notificationUnit as NotificationUnit,
    };

    try {
      await onSubmit(payload);
    } catch {
      // Parent handles errors; prevent unhandled promise rejection.
    }
  };

  const title = mode === 'edit' ? '일정 수정' : '일정 추가';

  const labelClass = 'text-[11px] font-semibold text-black/60';
  const requiredMark = <span className="ml-1 text-[#05C075]">*</span>;
  const fieldClass =
    'h-10 w-full rounded-2xl border border-black/10 bg-white px-3 text-sm text-black placeholder:text-black/30 focus:border-[#05C075] focus:outline-none focus:ring-2 focus:ring-[#05C075]/20';
  const compactFieldClass =
    'h-10 rounded-2xl border border-black/10 bg-white px-3 text-sm text-black focus:border-[#05C075] focus:outline-none focus:ring-2 focus:ring-[#05C075]/20';
  const dateFieldClass = fieldClass;
  const tagFieldClass =
    'h-10 w-full rounded-2xl border border-black/10 bg-white px-3 text-sm text-black placeholder:text-black/30 focus:border-[#05C075] focus:outline-none focus:ring-2 focus:ring-[#05C075]/20';
  const textAreaClass =
    'min-h-[80px] w-full rounded-2xl border border-black/10 bg-white px-3 py-2 text-sm text-black placeholder:text-black/30 focus:border-[#05C075] focus:outline-none focus:ring-2 focus:ring-[#05C075]/20';

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title={title}
      variant="sheet"
      contentClassName="max-w-[420px] pt-3"
    >
      {modeError ? (
        <p className="mt-3 text-sm text-red-600">{modeError}</p>
      ) : (
        <form className="mt-3 space-y-4 text-sm" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>
              전형 단계
              {requiredMark}
            </label>
            <div className="flex gap-2" role="radiogroup" aria-label="전형 단계">
              {stageOptions.map((option) => {
                const isSelected = formState.stage === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setFormState((prev) => ({ ...prev, stage: option.value }))}
                    className={`h-10 flex-1 rounded-2xl border text-sm font-semibold transition-colors ${
                      isSelected
                        ? 'border-[#05C075] bg-[#05C075] text-white'
                        : 'border-black/10 bg-black/[0.02] text-black/70 hover:bg-black/5'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
            {errors.stage && <p className="text-xs text-red-600">{errors.stage}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>
              제목
              {requiredMark}
            </label>
            <input
              className={fieldClass}
              value={formState.title}
              onChange={handleChange('title')}
              placeholder="예: 1차 면접"
            />
            {errors.title && <p className="text-xs text-red-600">{errors.title}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>
              회사
              {requiredMark}
            </label>
            <input
              className={fieldClass}
              value={formState.company}
              onChange={handleChange('company')}
              placeholder="예: Devths"
            />
            {errors.company && <p className="text-xs text-red-600">{errors.company}</p>}
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>
                시작 시간
                {requiredMark}
              </label>
              <input
                type="datetime-local"
                className={dateFieldClass}
                value={formState.startTime}
                onChange={handleChange('startTime')}
              />
              {errors.startTime && <p className="text-xs text-red-600">{errors.startTime}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>
                종료 시간
                {requiredMark}
              </label>
              <input
                type="datetime-local"
                className={dateFieldClass}
                value={formState.endTime}
                onChange={handleChange('endTime')}
              />
              {errors.endTime && <p className="text-xs text-red-600">{errors.endTime}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>설명</label>
            <textarea
              className={textAreaClass}
              value={formState.description}
              onChange={handleChange('description')}
              placeholder="일정에 대한 설명을 입력하세요"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>태그</label>
            <input
              className={tagFieldClass}
              value={formState.tags}
              onChange={handleChange('tags')}
              placeholder="예: 프론트엔드, 인턴"
            />
            <p className="text-[11px] text-black/40">콤마(,)로 구분해 입력하세요.</p>
          </div>

          <div className="flex flex-col gap-2">
            <label className={labelClass}>
              알림 설정
              {requiredMark}
            </label>
            <div className="rounded-2xl bg-white p-2">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  className={`${compactFieldClass} w-20 text-center`}
                  value={formState.notificationTime}
                  onChange={handleChange('notificationTime')}
                />
                <select
                  className={`${compactFieldClass} w-24 pr-8`}
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
                <span className="text-sm font-semibold text-black/60">전 알림</span>
              </div>
            </div>
            {(errors.notificationTime || errors.notificationUnit) && (
              <p className="text-xs text-red-600">
                {errors.notificationTime || errors.notificationUnit}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              className="h-10 w-full rounded-full border border-black/10 bg-white px-4 text-sm font-semibold text-black/70 transition-colors hover:bg-black/5"
              onClick={onClose}
              disabled={submitting}
            >
              취소
            </button>
            <button
              type="submit"
              className="h-10 w-full rounded-full bg-[#05C075] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#04A865] disabled:opacity-50"
              disabled={isSubmitDisabled || submitting}
            >
              {submitting ? '저장 중...' : '저장'}
            </button>
          </div>
          {submitError && <p className="text-xs text-red-600">{submitError}</p>}
        </form>
      )}
    </BaseModal>
  );
}
