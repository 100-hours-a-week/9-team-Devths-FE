'use client';

import { X } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import BaseModal from '@/components/common/BaseModal';
import NicknameField from '@/components/common/NicknameField';
import ProfileImagePicker from '@/components/common/ProfileImagePicker';
import FileTooLargeModal from '@/components/signup/FileTooLargeModal';
import { INTEREST_OPTIONS, normalizeInterests } from '@/constants/interests';
import { getUserIdFromAccessToken } from '@/lib/auth/token';
import { ApiError } from '@/lib/errors/ApiError';
import { useDeleteProfileImageMutation } from '@/lib/hooks/users/useDeleteProfileImageMutation';
import { useUpdateMeMutation } from '@/lib/hooks/users/useUpdateMeMutation';
import { useUploadProfileImageMutation } from '@/lib/hooks/users/useUpdateProfileImageMutation';
import { toast } from '@/lib/toast/store';
import { resizeProfileImage } from '@/lib/utils/resizeProfileImage';
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
  onClose: () => void;
  onWithdraw: () => void;
};

type EditFormValues = {
  nickname: string;
};

function EditForm({ initialData, onClose, onWithdraw }: EditFormProps) {
  const {
    control,
    handleSubmit,
    setError,
    formState: { isValid },
  } = useForm<EditFormValues>({
    defaultValues: { nickname: initialData?.nickname ?? '' },
    mode: 'onChange',
  });

  const [interests, setInterests] = useState<string[]>(
    normalizeInterests(initialData?.interests ?? []),
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialData?.profileImage?.url ?? null,
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProfileImageDeleted, setIsProfileImageDeleted] = useState(false);
  const [isFileTooLargeOpen, setIsFileTooLargeOpen] = useState(false);
  const [deleteSuccessMessage, setDeleteSuccessMessage] = useState<string | null>(null);

  const updateMutation = useUpdateMeMutation();
  const uploadImageMutation = useUploadProfileImageMutation();
  const deleteProfileImageMutation = useDeleteProfileImageMutation();

  const isPending =
    updateMutation.isPending ||
    uploadImageMutation.isPending ||
    deleteProfileImageMutation.isPending;

  const hasServerImage =
    Boolean(initialData?.profileImage?.url) && !selectedFile && !isProfileImageDeleted;
  const userId = getUserIdFromAccessToken();

  const handleToggleInterest = (value: string) => {
    setInterests((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };

  const handleSelectImage = async (file: File) => {
    let fileToUse = file;
    try {
      fileToUse = await resizeProfileImage(file);
    } catch {
      // 리사이즈 실패 시 원본 파일 사용
    }
    const url = URL.createObjectURL(fileToUse);
    setPreviewUrl(url);
    setSelectedFile(fileToUse);
    setIsProfileImageDeleted(false);
    setDeleteSuccessMessage(null);
  };

  const handleDeleteImage = async () => {
    if (selectedFile) {
      setPreviewUrl(isProfileImageDeleted ? null : (initialData?.profileImage?.url ?? null));
      setSelectedFile(null);
      return;
    }

    const fileId = initialData?.profileImage?.id;
    if (hasServerImage && fileId) {
      try {
        await deleteProfileImageMutation.mutateAsync({ fileId });
        setPreviewUrl(null);
        setIsProfileImageDeleted(true);
        setDeleteSuccessMessage('프로필 사진이 삭제되었습니다.');
      } catch {
        setDeleteSuccessMessage(null);
      }
    }
  };

  const onSubmit = handleSubmit(async (values) => {
    const initialNickname = initialData?.nickname ?? '';
    const initialInterests = normalizeInterests(initialData?.interests ?? []);

    const hasImageChange = Boolean(selectedFile) || isProfileImageDeleted;
    const hasNicknameChange = values.nickname !== initialNickname;
    const hasInterestsChange =
      interests.length !== initialInterests.length ||
      interests.some((v) => !initialInterests.includes(v as (typeof initialInterests)[number]));

    if (!hasImageChange && !hasNicknameChange && !hasInterestsChange) {
      setError('nickname', { message: '변경된 내용이 없습니다.' });
      return;
    }

    try {
      if (selectedFile) {
        if (!userId) {
          setError('nickname', { message: '유저 정보를 확인할 수 없습니다.' });
          return;
        }

        await uploadImageMutation.mutateAsync({ file: selectedFile, userId });
        setSelectedFile(null);
      }

      await updateMutation.mutateAsync({
        nickname: values.nickname,
        interests: hasInterestsChange ? interests : undefined,
      });

      toast('회원 정보가 성공적으로 변경되었습니다.');
      onClose();
    } catch (error) {
      const err = ApiError.fromUnknown(error);
      if (err.status === 409) {
        setError('nickname', { message: '중복된 닉네임입니다.' });
      } else {
        setError('nickname', {
          message: err.serverMessage ?? '프로필 수정에 실패했습니다.',
        });
      }
    }
  });

  const hasProfileImage = Boolean(previewUrl);

  return (
    <div className="mt-1 flex flex-col gap-0">
      <header className="space-y-1">
        <div className="flex items-center gap-2" />
        <h2 className="text-lg font-bold text-neutral-900">프로필 수정</h2>
        <p className="text-[11px] text-neutral-500">
          변경사항은 저장 후 즉시 마이페이지에 반영됩니다.
        </p>
      </header>

      <section className="rounded-2xl bg-white p-2">
        <p className="text-xs font-semibold text-neutral-900">프로필 사진</p>
        <div className="mt-2 flex flex-col items-center">
          <ProfileImagePicker
            previewUrl={previewUrl}
            fallbackInitial={initialData?.nickname}
            onSelect={handleSelectImage}
            onFileTooLarge={() => setIsFileTooLargeOpen(true)}
            size="sm"
            compact
          />
          {hasProfileImage && (
            <button
              type="button"
              onClick={handleDeleteImage}
              disabled={deleteProfileImageMutation.isPending}
              className="mt-2 rounded-full border border-neutral-300 px-3 py-1 text-[11px] font-semibold text-neutral-700 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleteProfileImageMutation.isPending ? '삭제 중...' : '사진 삭제'}
            </button>
          )}
        </div>
      </section>

      <section className="rounded-2xl bg-white p-2">
        <Controller
          name="nickname"
          control={control}
          rules={{
            validate: (value) => {
              const { isValid: valid, errorMessage } = validateNickname(value);
              return valid ? true : (errorMessage ?? false);
            },
          }}
          render={({ field, fieldState }) => (
            <NicknameField
              value={field.value}
              onChange={field.onChange}
              errorMessage={fieldState.error?.message ?? null}
            />
          )}
        />
        {deleteSuccessMessage && (
          <p className="-mt-3 text-[11px] text-green-600">{deleteSuccessMessage}</p>
        )}
      </section>

      <section className="rounded-2xl bg-white p-2">
        <p className="text-xs font-semibold text-neutral-900">관심 분야</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {INTEREST_OPTIONS.filter((o) => interests.includes(o.value)).map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleToggleInterest(option.value)}
              className="inline-flex items-center gap-1 rounded-full border border-[#05C075] bg-white px-2.5 py-1 text-xs font-semibold text-[#05C075] shadow-sm"
            >
              {option.label}
              <X aria-hidden="true" className="h-3.5 w-3.5" />
            </button>
          ))}
          {INTEREST_OPTIONS.filter((o) => !interests.includes(o.value)).map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleToggleInterest(option.value)}
              className="rounded-full border border-neutral-300 px-2.5 py-1 text-xs font-semibold text-neutral-800 hover:bg-white"
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      <div className="flex flex-col items-center gap-2.5 pt-3">
        <button
          type="button"
          onClick={onSubmit}
          disabled={!isValid || isPending}
          className="h-10 w-full rounded-xl bg-[#05C075] text-sm font-semibold text-white shadow-sm hover:bg-[#04A865] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? '변경 중...' : '변경하기'}
        </button>

        <button
          type="button"
          onClick={onWithdraw}
          className="text-sm font-semibold text-red-500 hover:text-red-600"
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
    <BaseModal open={open} onClose={onClose} contentClassName="max-w-[360px] p-4">
      <EditForm
        key={open ? 'open' : 'closed'}
        initialData={initialData}
        onClose={onClose}
        onWithdraw={onWithdraw}
      />
    </BaseModal>
  );
}
