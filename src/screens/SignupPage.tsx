'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import InterestChips from '@/components/common/InterestChips';
import NicknameField from '@/components/common/NicknameField';
import PrimaryButton from '@/components/common/PrimaryButton';
import ProfileImagePicker from '@/components/common/ProfileImagePicker';
import FileTooLargeModal from '@/components/signup/FileTooLargeModal';
import { INTEREST_OPTIONS, type InterestValue } from '@/constants/interests';
import { postPresignedSignup } from '@/lib/api/files';
import { postSignup } from '@/lib/api/users';
import { clearSignupContext, getSignupEmail, getTempToken } from '@/lib/auth/token';
import { toast } from '@/lib/toast/store';
import { uploadToPresignedUrl } from '@/lib/upload/s3Presigned';
import { getNicknameErrorMessage } from '@/lib/validators/nickname';

export default function SignupPage() {
  const router = useRouter();

  const [nickname, setNickname] = useState('');
  const [interests, setInterests] = useState<InterestValue[]>([]);
  const [isFileTooLargeOpen, setIsFileTooLargeOpen] = useState(false);

  const [profilePreviewUrl, setProfilePreviewUrl] = useState<string | null>(null);
  const [isUploadingProfile, setIsUploadingProfile] = useState(false);
  const [profileImageS3Key, setProfileImageS3Key] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [tempToken, setTempTokenState] = useState<string | null>(null);
  const [email, setEmailState] = useState<string | null>(null);

  useEffect(() => {
    setTempTokenState(getTempToken());
    setEmailState(getSignupEmail());
  }, []);

  useEffect(() => {
    if (tempToken === null || email === null) return;
    if (!tempToken || !email) {
      toast('회원가입을 진행하려면 로그인이 필요합니다.');
      router.replace('/');
    }
  }, [router, tempToken, email]);

  const trimmedNickname = nickname.trim();
  const nicknameErrorMessage = useMemo(() => {
    if (trimmedNickname.length === 0) return null;
    return getNicknameErrorMessage(trimmedNickname);
  }, [trimmedNickname]);
  const isNicknameValid = trimmedNickname.length > 0 && nicknameErrorMessage === null;
  const hasInterests = interests.length > 0;

  const handleToggleInterest = (value: InterestValue) => {
    setInterests((prev) =>
      prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value],
    );
  };

  useEffect(() => {
    return () => {
      if (profilePreviewUrl) URL.revokeObjectURL(profilePreviewUrl);
    };
  }, [profilePreviewUrl]);

  const uploadProfileImage = async (file: File) => {
    setIsUploadingProfile(true);
    setProfileImageS3Key(null);

    try {
      const presignedRes = await postPresignedSignup({
        fileName: file.name,
        mimeType: file.type,
      });

      if (!presignedRes.ok || !presignedRes.json || presignedRes.json.data === null) {
        const msg =
          presignedRes.json?.message ?? `presigned 요청 실패 (HTTP ${presignedRes.status})`;
        toast(msg);
        return null;
      }

      const { presignedUrl, s3Key } = presignedRes.json.data;

      await uploadToPresignedUrl({ presignedUrl, file });

      setProfileImageS3Key(s3Key);
      return s3Key;
    } catch (e) {
      const msg = e instanceof Error ? e.message : '프로필 이미지 업로드 중 오류가 발생했습니다.';
      toast(msg);
      setProfileImageS3Key(null);
      return null;
    } finally {
      setIsUploadingProfile(false);
    }
  };

  const createDefaultProfileImageFile = async (label: string) => {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('프로필 이미지 생성을 위한 컨텍스트를 생성할 수 없습니다.');

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, size, size);

    const initial = Array.from(label)[0] ?? '';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `600 120px 'Pretendard', 'Noto Sans KR', sans-serif`;
    ctx.fillText(initial, size / 2, size / 2);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((result) => {
        if (!result) reject(new Error('기본 프로필 이미지 생성에 실패했습니다.'));
        else resolve(result);
      }, 'image/png');
    });

    return new File([blob], 'default-profile.png', { type: 'image/png' });
  };

  const handleSelectProfile = async (file: File) => {
    // preview
    if (profilePreviewUrl) URL.revokeObjectURL(profilePreviewUrl);
    setProfilePreviewUrl(URL.createObjectURL(file));

    // upload flow
    await uploadProfileImage(file);
  };

  const handleSubmit = async () => {
    if (!tempToken || !email) return;
    if (!isNicknameValid) return;
    if (!hasInterests) return;

    setIsSubmitting(true);
    try {
      let finalProfileImageS3Key = profileImageS3Key;

      if (!finalProfileImageS3Key) {
        const defaultFile = await createDefaultProfileImageFile(trimmedNickname);
        finalProfileImageS3Key = await uploadProfileImage(defaultFile);
        if (!finalProfileImageS3Key) return;
      }

      const { ok, status, json } = await postSignup({
        email,
        nickname: nickname.trim(),
        interests,
        tempToken,
        ...(finalProfileImageS3Key ? { profileImageS3Key: finalProfileImageS3Key } : {}),
      });

      if (!ok || !json || json.data === null) {
        const msg = json?.message ?? `회원가입 실패 (HTTP ${status})`;
        toast(msg);
        return;
      }

      toast('회원가입이 완료되었습니다.');

      clearSignupContext();

      router.replace('/llm');
    } catch (e) {
      const msg = e instanceof Error ? e.message : '회원가입 처리 중 오류가 발생했습니다.';
      toast(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (tempToken === null || email === null || !tempToken || !email) {
    return (
      <main className="flex min-h-dvh items-center justify-center px-6">
        <p className="text-sm text-neutral-600">회원가입 페이지 준비 중...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[420px] flex-col px-5 pt-20 pb-10">
      <header className="mb-10 flex justify-center">
        <h1 className="text-5xl font-bold tracking-tight">Devths</h1>
      </header>

      <section className="flex flex-1 flex-col gap-8">
        <ProfileImagePicker
          previewUrl={profilePreviewUrl}
          onSelect={handleSelectProfile}
          onFileTooLarge={() => setIsFileTooLargeOpen(true)}
          onInvalidType={() => toast('지원하지 않는 파일 형식입니다. (jpg/jpeg/png/webp만 가능)')}
        />

        {isUploadingProfile ? (
          <p className="text-center text-xs text-neutral-600">프로필 사진 업로드 중...</p>
        ) : profileImageS3Key ? (
          <p className="text-center text-xs text-neutral-600">프로필 사진 업로드 완료</p>
        ) : null}

        <div className="px-1">
          <NicknameField
            value={nickname}
            onChange={setNickname}
            errorMessage={nicknameErrorMessage}
          />
        </div>

        <div className="px-1">
          <div className="text-sm font-semibold">관심 분야</div>
          <div className="mt-3">
            <InterestChips
              options={INTEREST_OPTIONS}
              selected={interests}
              onToggle={handleToggleInterest}
            />
          </div>
        </div>
      </section>

      <footer className="mt-auto pt-8">
        <PrimaryButton
          disabled={!isNicknameValid || !hasInterests || isUploadingProfile || isSubmitting}
          onClick={handleSubmit}
        >
          시작하기
        </PrimaryButton>
      </footer>

      <FileTooLargeModal open={isFileTooLargeOpen} onClose={() => setIsFileTooLargeOpen(false)} />
    </main>
  );
}
