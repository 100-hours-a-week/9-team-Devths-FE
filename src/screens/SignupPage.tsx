'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import InterestChips from '@/components/common/InterestChips';
import NicknameField from '@/components/common/NicknameField';
import PrimaryButton from '@/components/common/PrimaryButton';
import ProfileImagePicker from '@/components/common/ProfileImagePicker';
import FileTooLargeModal from '@/components/signup/FileTooLargeModal';
import { INTEREST_OPTIONS, type InterestValue } from '@/constants/interests';
import { getTempToken } from '@/lib/auth/token';
import { toast } from '@/lib/toast/store';
import { getNicknameErrorMessage } from '@/lib/validators/nickname';

export default function SignupPage() {
  const router = useRouter();

  const [nickname, setNickname] = useState('');
  const [interests, setInterests] = useState<InterestValue[]>([]);
  const [isFileTooLargeOpen, setIsFileTooLargeOpen] = useState(false);

  const tempToken = useMemo(() => getTempToken(), []);

  useEffect(() => {
    if (!tempToken) {
      toast('회원가입을 진행하려면 로그인이 필요합니다.');
      router.replace('/');
    }
  }, [router, tempToken]);

  const nicknameErrorMessage = useMemo(() => getNicknameErrorMessage(nickname), [nickname]);
  const isNicknameValid = nicknameErrorMessage === null;

  const handleToggleInterest = (value: InterestValue) => {
    setInterests((prev) =>
      prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value],
    );
  };

  if (!tempToken) {
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
        <ProfileImagePicker onClickAdd={() => setIsFileTooLargeOpen(true)} />

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
          disabled={!isNicknameValid}
          onClick={() => toast('회원가입이 완료되었습니다.')}
        >
          시작하기
        </PrimaryButton>
      </footer>

      <FileTooLargeModal open={isFileTooLargeOpen} onClose={() => setIsFileTooLargeOpen(false)} />
    </main>
  );
}
