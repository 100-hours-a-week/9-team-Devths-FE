'use client';

import { useState } from 'react';

import NicknameField from '@/components/common/NicknameField';

export default function SignupPage() {
  const [nickname, setNickname] = useState('');

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[420px] flex-col px-5 py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">회원가입</h1>
        <p className="text-muted-foreground mt-2 text-sm">닉네임과 관심 분야를 설정해 주세요.</p>
      </header>

      <section className="flex flex-1 flex-col gap-8">
        <div className="bg-background rounded-2xl border p-4">
          <div className="text-sm font-semibold">프로필 이미지</div>
          <div className="bg-muted mt-3 h-20 rounded-xl" />
        </div>

        <div>
          <NicknameField value={nickname} onChange={setNickname} errorMessage={null} />
        </div>

        <div className="bg-background rounded-2xl border p-4">
          <div className="text-sm font-semibold">관심 분야</div>
          <div className="mt-3 flex flex-wrap gap-2">
            <div className="bg-muted h-9 w-20 rounded-full" />
            <div className="bg-muted h-9 w-24 rounded-full" />
            <div className="bg-muted h-9 w-16 rounded-full" />
            <div className="bg-muted h-9 w-28 rounded-full" />
          </div>
        </div>
      </section>

      <footer className="mt-8">
        <div className="bg-muted h-14 w-full rounded-full" />
      </footer>
    </main>
  );
}
