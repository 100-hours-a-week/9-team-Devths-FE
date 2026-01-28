'use client';

import BaseModal from '@/components/common/BaseModal';

type WithdrawModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function WithdrawModal({ open, onClose }: WithdrawModalProps) {
  if (!open) return null;

  return (
    <BaseModal open={open} onClose={onClose} title="회원 탈퇴">
      <div className="mt-4">
        <p className="text-sm text-neutral-600">탈퇴 기능은 다음 커밋에서 구현됩니다.</p>
      </div>
    </BaseModal>
  );
}
