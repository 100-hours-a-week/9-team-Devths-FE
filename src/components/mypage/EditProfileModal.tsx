'use client';

import { X } from 'lucide-react';

import BaseModal from '@/components/common/BaseModal';
import NicknameField from '@/components/common/NicknameField';
import ProfileImagePicker from '@/components/common/ProfileImagePicker';
import { INTEREST_OPTIONS } from '@/constants/interests';

type EditProfileModalProps = {
  open: boolean;
  onClose: () => void;
  hasProfileImage?: boolean;
};

export default function EditProfileModal({
  open,
  onClose,
  hasProfileImage = false,
}: EditProfileModalProps) {
  const selectedInterests: string[] = ['FRONTEND'];

  return (
    <BaseModal open={open} onClose={onClose} title="프로필 수정">
      <div className="mt-4 flex flex-col gap-6">
        <div className="flex flex-col items-center">
          <ProfileImagePicker previewUrl={null} onSelect={() => {}} />
          {hasProfileImage && (
            <button
              type="button"
              className="mt-2 rounded-lg bg-neutral-200 px-4 py-1.5 text-sm text-neutral-600 hover:bg-neutral-300"
            >
              삭제
            </button>
          )}
        </div>

        <NicknameField value="" onChange={() => {}} />

        <div>
          <p className="text-sm font-semibold">관심 분야 수정</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {INTEREST_OPTIONS.map((option) => {
              const isSelected = selectedInterests.includes(option.value);
              return isSelected ? (
                <button
                  key={option.value}
                  type="button"
                  className="inline-flex items-center gap-1 rounded-full bg-neutral-900 px-3 py-1.5 text-sm text-white"
                >
                  {option.label}
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  key={option.value}
                  type="button"
                  className="rounded-full border border-neutral-300 px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50"
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 pt-2">
          <button
            type="button"
            className="h-12 w-full rounded-xl bg-neutral-900 text-sm font-semibold text-white hover:bg-neutral-800"
          >
            변경하기
          </button>

          <button type="button" className="text-sm text-neutral-400 hover:text-neutral-600">
            탈퇴하기
          </button>
        </div>
      </div>
    </BaseModal>
  );
}
