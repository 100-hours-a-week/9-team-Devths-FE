'use client';

import { X } from 'lucide-react';
import { useState } from 'react';

import BaseModal from '@/components/common/BaseModal';
import NicknameField from '@/components/common/NicknameField';
import ProfileImagePicker from '@/components/common/ProfileImagePicker';
import FileTooLargeModal from '@/components/signup/FileTooLargeModal';
import { INTEREST_OPTIONS, normalizeInterests } from '@/constants/interests';
import { useDeleteProfileImageMutation } from '@/lib/hooks/users/useDeleteProfileImageMutation';
import { useUpdateMeMutation } from '@/lib/hooks/users/useUpdateMeMutation';
import { useUpdateProfileImageMutation } from '@/lib/hooks/users/useUpdateProfileImageMutation';
import { validateNickname } from '@/lib/utils/validateNickname';

import type { MeData } from '@/lib/api/users';

type EditProfileModalProps = {
  open: boolean;
  onClose: () => void;
  onWithdraw: () => void;
  initialData?: MeData | null;
};

type EditFormProps = {
  initialData?: MeData | null;
  onWithdraw: () => void;
};

function EditForm({ initialData, onWithdraw }: EditFormProps) {
  const [nickname, setNickname] = useState(initialData?.nickname ?? '');
  const [interests, setInterests] = useState<string[]>(
    normalizeInterests(initialData?.interests ?? []),
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialData?.profileImage?.url ?? null,
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isFileTooLargeOpen, setIsFileTooLargeOpen] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const nicknameValidation = validateNickname(nickname);
  const updateMutation = useUpdateMeMutation();
  const updateProfileImageMutation = useUpdateProfileImageMutation();
  const deleteProfileImageMutation = useDeleteProfileImageMutation();

  const isPending =
    updateMutation.isPending ||
    updateProfileImageMutation.isPending ||
    deleteProfileImageMutation.isPending;

  const hasServerImage = Boolean(initialData?.profileImage?.url) && !selectedFile;

  const handleToggleInterest = (value: string) => {
    setInterests((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
    setSubmitMessage(null);
  };

  const handleSelectImage = (file: File) => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setSelectedFile(file);
    setSubmitMessage(null);
  };

  const handleDeleteImage = async () => {
    if (selectedFile) {
      setPreviewUrl(initialData?.profileImage?.url ?? null);
      setSelectedFile(null);
      return;
    }

    if (hasServerImage) {
      try {
        await deleteProfileImageMutation.mutateAsync();
        setPreviewUrl(null);
        setSubmitMessage({ type: 'success', text: '프로필 사진이 삭제되었습니다.' });
      } catch {
        setSubmitMessage({ type: 'error', text: '프로필 사진 삭제에 실패했습니다.' });
      }
    }
  };

  const handleNicknameChange = (value: string) => {
    setNickname(value);
    setSubmitMessage(null);
  };

  const handleSubmit = async () => {
    if (!nicknameValidation.isValid) return;

    setSubmitMessage(null);

    try {
      if (selectedFile) {
        await updateProfileImageMutation.mutateAsync({ file: selectedFile });
        setSelectedFile(null);
      }

      await updateMutation.mutateAsync({ nickname, interests });

      setSubmitMessage({ type: 'success', text: '회원 정보가 성공적으로 변경되었습니다.' });
    } catch (error) {
      const err = error as Error & { status?: number; serverMessage?: string };
      if (err.status === 409) {
        setSubmitMessage({ type: 'error', text: '중복된 닉네임입니다.' });
      } else {
        setSubmitMessage({
          type: 'error',
          text: err.serverMessage ?? '프로필 수정에 실패했습니다.',
        });
      }
    }
  };

  const hasProfileImage = Boolean(previewUrl);

  const helperMessage =
    nicknameValidation.errorMessage ??
    (submitMessage?.type === 'error' ? submitMessage.text : null);

  return (
    <div className="mt-4 flex flex-col gap-6">
      <div className="flex flex-col items-center">
        <ProfileImagePicker
          previewUrl={previewUrl}
          onSelect={handleSelectImage}
          onFileTooLarge={() => setIsFileTooLargeOpen(true)}
        />
        {hasProfileImage && (
          <button
            type="button"
            onClick={handleDeleteImage}
            disabled={deleteProfileImageMutation.isPending}
            className="mt-2 rounded-lg bg-neutral-200 px-4 py-1.5 text-sm text-neutral-600 hover:bg-neutral-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deleteProfileImageMutation.isPending ? '삭제 중...' : '삭제'}
          </button>
        )}
      </div>

      <div>
        <NicknameField
          value={nickname}
          onChange={handleNicknameChange}
          errorMessage={helperMessage}
        />
        {submitMessage?.type === 'success' && (
          <p className="-mt-3 text-xs text-green-600">{submitMessage.text}</p>
        )}
      </div>

      <div>
        <p className="text-sm font-semibold">관심 분야 수정</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {INTEREST_OPTIONS.filter((o) => interests.includes(o.value)).map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleToggleInterest(option.value)}
              className="inline-flex items-center gap-1 rounded-full bg-neutral-900 px-3 py-1.5 text-sm text-white"
            >
              {option.label}
              <X className="h-3.5 w-3.5" />
            </button>
          ))}
          {INTEREST_OPTIONS.filter((o) => !interests.includes(o.value)).map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleToggleInterest(option.value)}
              className="rounded-full border border-neutral-300 px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50"
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 pt-2">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!nicknameValidation.isValid || isPending}
          className="h-12 w-full rounded-xl bg-neutral-900 text-sm font-semibold text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? '변경 중...' : '변경하기'}
        </button>

        <button
          type="button"
          onClick={onWithdraw}
          className="text-sm text-neutral-400 hover:text-neutral-600"
        >
          탈퇴하기
        </button>
      </div>

      <FileTooLargeModal open={isFileTooLargeOpen} onClose={() => setIsFileTooLargeOpen(false)} />
    </div>
  );
}

export default function EditProfileModal({
  open,
  onClose,
  onWithdraw,
  initialData,
}: EditProfileModalProps) {
  if (!open) return null;

  return (
    <BaseModal open={open} onClose={onClose} title="프로필 수정">
      <EditForm key={open ? 'open' : 'closed'} initialData={initialData} onWithdraw={onWithdraw} />
    </BaseModal>
  );
}
