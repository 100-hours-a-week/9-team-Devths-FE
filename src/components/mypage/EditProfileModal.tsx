import BaseModal from '@/components/common/BaseModal';

type EditProfileModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function EditProfileModal({ open, onClose }: EditProfileModalProps) {
  return (
    <BaseModal open={open} onClose={onClose} title="프로필 수정">
      <div className="mt-4">
        <p className="text-sm text-neutral-500">프로필 수정 폼이 들어갈 영역입니다.</p>
      </div>
    </BaseModal>
  );
}
