'use client';

import { useState } from 'react';

import InterestChips from '@/components/common/InterestChips';
import NicknameField from '@/components/common/NicknameField';
import PrimaryButton from '@/components/common/PrimaryButton';
import ProfileImagePicker from '@/components/common/ProfileImagePicker';
import FileTooLargeModal from '@/components/signup/FileTooLargeModal';
import { toast } from '@/lib/toast/store';

const INTEREST_OPTIONS = ['BE', 'FE', 'Cloud', 'AI'];

export default function SignupPage() {
  const [nickname, setNickname] = useState('');
  const [isFileTooLargeOpen, setIsFileTooLargeOpen] = useState(false);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[420px] flex-col px-5 pt-20 pb-10">
      <header className="mb-10 flex justify-center">
        <h1 className="text-5xl font-bold tracking-tight">Devths</h1>
      </header>

      <section className="flex flex-1 flex-col gap-8">
        <ProfileImagePicker onClickAdd={() => setIsFileTooLargeOpen(true)} />

        <div className="px-1">
          <NicknameField value={nickname} onChange={setNickname} errorMessage={null} />
        </div>

        <div className="px-1">
          <div className="text-sm font-semibold">관심 분야</div>
          <div className="mt-3">
            <InterestChips options={INTEREST_OPTIONS} selected={['FE']} />
          </div>
        </div>
      </section>

      <footer className="mt-auto pt-8">
        <PrimaryButton disabled={false} onClick={() => toast('회원가입이 완료되었습니다.')}>
          시작하기
        </PrimaryButton>
      </footer>

      <FileTooLargeModal open={isFileTooLargeOpen} onClose={() => setIsFileTooLargeOpen(false)} />
    </main>
  );
}
