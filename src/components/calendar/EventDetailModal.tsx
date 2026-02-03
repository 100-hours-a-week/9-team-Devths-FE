'use client';

import BaseModal from '@/components/common/BaseModal';

import type { GoogleEventDetailResponse, InterviewStage, NotificationUnit } from '@/types/calendar';

type EventDetailModalProps = {
  open: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  deleteLoading?: boolean;
  loading: boolean;
  error: string | null;
  detail: GoogleEventDetailResponse | null;
};

const stageLabels: Record<InterviewStage, string> = {
  DOCUMENT: '서류',
  CODING_TEST: '코딩 테스트',
  INTERVIEW: '면접',
};

const notificationUnitLabels: Record<NotificationUnit, string> = {
  MINUTE: '분 전',
  HOUR: '시간 전',
  DAY: '일 전',
};

const stageBadgeClasses: Record<InterviewStage, string> = {
  DOCUMENT: 'border-[#05C075]/40 bg-[#05C075]/10 text-[#05C075]',
  CODING_TEST: 'border-[#F4C430]/40 bg-[#F4C430]/15 text-[#B08200]',
  INTERVIEW: 'border-[#3B82F6]/40 bg-[#3B82F6]/12 text-[#2563EB]',
};

function formatDateTime(value: string) {
  return value.replace('T', ' ');
}

function renderContent({
  loading,
  error,
  detail,
}: Pick<EventDetailModalProps, 'loading' | 'error' | 'detail'>) {
  if (loading) {
    return <p className="text-sm">로딩 중...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (!detail) {
    return <p className="text-sm">일정 정보를 불러올 수 없습니다.</p>;
  }

  const notificationLabel =
    detail.notificationTime === null
      ? '없음'
      : `${detail.notificationTime}${notificationUnitLabels[detail.notificationUnit]}`;

  return (
    <div className="mt-3 space-y-4 text-sm">
      <div className="rounded-2xl bg-black/[0.02] px-4 py-3">
        <p className="text-[11px] font-semibold text-black/50">제목</p>
        <p className="mt-1 text-base font-semibold text-black">{detail.title}</p>
      </div>
      <div className="rounded-2xl bg-black/[0.02] px-4 py-3">
        <p className="text-[11px] font-semibold text-black/50">회사</p>
        <p className="mt-1 text-sm font-semibold text-black/70">{detail.company}</p>
      </div>

      <dl className="space-y-3">
        <div className="flex items-center justify-between">
          <dt className="text-[11px] font-semibold text-black/50">단계</dt>
          <dd
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
              stageBadgeClasses[detail.stage]
            }`}
          >
            {stageLabels[detail.stage]}
          </dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-[11px] font-semibold text-black/50">시간</dt>
          <dd className="text-sm font-medium text-black">
            {formatDateTime(detail.startTime)} ~ {formatDateTime(detail.endTime)}
          </dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-[11px] font-semibold text-black/50">설명</dt>
          <dd className="text-sm text-black/70">{detail.description || '없음'}</dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-[11px] font-semibold text-black/50">태그</dt>
          <dd className="text-sm text-black/70">
            {detail.tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {detail.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[#05C075]/10 px-2 py-1 text-xs font-semibold text-[#05C075]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : (
              '없음'
            )}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-[11px] font-semibold text-black/50">알림</dt>
          <dd className="text-sm font-semibold text-black/70">{notificationLabel}</dd>
        </div>
      </dl>
    </div>
  );
}

export default function EventDetailModal({
  open,
  onClose,
  onEdit,
  onDelete,
  deleteLoading = false,
  loading,
  error,
  detail,
}: EventDetailModalProps) {
  const showActions = !loading && !error && Boolean(detail);
  const actionsDisabled = deleteLoading;
  const showEditButton = Boolean(onEdit) && showActions;
  const showDeleteButton = Boolean(onDelete) && showActions;

  return (
    <BaseModal open={open} onClose={onClose} title="일정 상세" contentClassName="pt-3">
      {renderContent({ loading, error, detail })}
      {(showEditButton || showDeleteButton) && (
        <div className="mt-5 flex justify-end gap-2">
          {showDeleteButton && (
            <button
              type="button"
              className="h-9 rounded-full border border-black/10 px-4 text-sm font-semibold text-black/70 transition-colors hover:bg-black/5 disabled:opacity-50"
              onClick={onDelete}
              disabled={actionsDisabled}
            >
              {deleteLoading ? '삭제 중...' : '삭제'}
            </button>
          )}
          {showEditButton && (
            <button
              type="button"
              className="h-9 rounded-full bg-[#05C075] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#04A865] disabled:opacity-50"
              onClick={onEdit}
              disabled={actionsDisabled}
            >
              수정
            </button>
          )}
        </div>
      )}
    </BaseModal>
  );
}
