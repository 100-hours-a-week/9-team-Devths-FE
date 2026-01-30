'use client';

import BaseModal from '@/components/common/BaseModal';

import type {
  GoogleEventDetailResponse,
  InterviewStage,
  NotificationUnit,
} from '@/types/calendar';

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
    <dl className="mt-3 space-y-2 text-sm">
      <div className="flex gap-3">
        <dt className="w-16 text-zinc-500">제목</dt>
        <dd className="flex-1 text-zinc-900">{detail.title}</dd>
      </div>
      <div className="flex gap-3">
        <dt className="w-16 text-zinc-500">회사</dt>
        <dd className="flex-1 text-zinc-900">{detail.company}</dd>
      </div>
      <div className="flex gap-3">
        <dt className="w-16 text-zinc-500">단계</dt>
        <dd className="flex-1 text-zinc-900">{stageLabels[detail.stage]}</dd>
      </div>
      <div className="flex gap-3">
        <dt className="w-16 text-zinc-500">시간</dt>
        <dd className="flex-1 text-zinc-900">
          {formatDateTime(detail.startTime)} ~ {formatDateTime(detail.endTime)}
        </dd>
      </div>
      <div className="flex gap-3">
        <dt className="w-16 text-zinc-500">설명</dt>
        <dd className="flex-1 text-zinc-900">{detail.description || '없음'}</dd>
      </div>
      <div className="flex gap-3">
        <dt className="w-16 text-zinc-500">태그</dt>
        <dd className="flex-1 text-zinc-900">
          {detail.tags.length > 0 ? detail.tags.join(', ') : '없음'}
        </dd>
      </div>
      <div className="flex gap-3">
        <dt className="w-16 text-zinc-500">알림</dt>
        <dd className="flex-1 text-zinc-900">{notificationLabel}</dd>
      </div>
    </dl>
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
    <BaseModal open={open} onClose={onClose} title="일정 상세">
      {renderContent({ loading, error, detail })}
      {(showEditButton || showDeleteButton) && (
        <div className="mt-4 flex justify-end gap-2">
          {showDeleteButton && (
            <button
              type="button"
              className="h-9 rounded-md border border-destructive px-4 text-sm text-destructive disabled:opacity-50"
              onClick={onDelete}
              disabled={actionsDisabled}
            >
              {deleteLoading ? '삭제 중...' : '삭제'}
            </button>
          )}
          {showEditButton && (
            <button
              type="button"
              className="h-9 rounded-md bg-primary px-4 text-sm text-primary-foreground disabled:opacity-50"
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
