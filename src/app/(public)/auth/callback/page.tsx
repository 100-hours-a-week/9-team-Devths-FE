import { Suspense } from 'react';

import AuthCallbackClient from '@/screens/auth/AuthCallbackClient';

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-dvh items-center justify-center px-6">
          <p className="text-sm text-neutral-600">로그인 처리 중...</p>
        </main>
      }
    >
      <AuthCallbackClient />
    </Suspense>
  );
}
