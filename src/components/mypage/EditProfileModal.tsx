'use client';

import { X } from 'lucide-react';
import { useState } from 'react';

import BaseModal from '@/components/common/BaseModal';
import NicknameField from '@/components/common/NicknameField';
import ProfileImagePicker from '@/components/common/ProfileImagePicker';
import { INTEREST_OPTIONS } from '@/constants/interests';

import type { MeData } from '@/lib/api/users';

type EditProfileModalProps = {
  open: boolean;
  onClose: () => void;
  initialData?: MeData | null;
};

type EditFormProps = {
  initialData?: MeData | null;
  onClose: () => void;
};

function EditForm({ initialData, onClose }: EditFormProps) {
  const [nickname, setNickname] = useState(initialData?.nickname ?? '');
  const [interests, setInterests] = useState<string[]>(initialData?.interests ?? []);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialData?.profileImage?.url ?? null,
  );

  const handleToggleInterest = (value: string) => {
    setInterests((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };

  const handleSelectImage = (file: File) => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const hasProfileImage = Boolean(previewUrl);

  return (
    <div className="mt-4 flex flex-col gap-6">
      <div className="flex flex-col items-center">
        <ProfileImagePicker previewUrl={previewUrl} onSelect={handleSelectImage} />
        {hasProfileImage && (
          <button
            type="button"
            onClick={() => setPreviewUrl(null)}
            className="mt-2 rounded-lg bg-neutral-200 px-4 py-1.5 text-sm text-neutral-600 hover:bg-neutral-300"
          >
            삭제
          </button>
        )}
      </div>

      <NicknameField value={nickname} onChange={setNickname} />

      <div>
        <p className="text-sm font-semibold">관심 분야 수정</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {INTEREST_OPTIONS.map((option) => {
            const isSelected = interests.includes(option.value);
            return isSelected ? (
              <button
                key={option.value}
                type="button"
                onClick={() => handleToggleInterest(option.value)}
                className="inline-flex items-center gap-1 rounded-full bg-neutral-900 px-3 py-1.5 text-sm text-white"
              >
                {option.label}
                <X className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                key={option.value}
                type="button"
                onClick={() => handleToggleInterest(option.value)}
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

        <button
          type="button"
          onClick={onClose}
          className="text-sm text-neutral-400 hover:text-neutral-600"
        >
          탈퇴하기
        </button>
      </div>
    </div>
  );
}

export default function EditProfileModal({ open, onClose, initialData }: EditProfileModalProps) {
  if (!open) return null;

  return (
    <BaseModal open={open} onClose={onClose} title="프로필 수정">
      <EditForm key={open ? 'open' : 'closed'} initialData={initialData} onClose={onClose} />
    </BaseModal>
  );
}
