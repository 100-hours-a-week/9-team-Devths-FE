import { Suspense } from 'react';

import AuthCallbackClient from '@/screens/auth/AuthCallbackClient';

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-dvh bg-transparent">
          <div className="mx-auto flex min-h-dvh w-full items-center justify-center bg-white px-6 sm:max-w-[430px] sm:shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
            <p className="text-sm text-neutral-600">로그인 처리 중...</p>
          </div>
        </main>
      }
    >
      <AuthCallbackClient />
    </Suspense>
  );
}
