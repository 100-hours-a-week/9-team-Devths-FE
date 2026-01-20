'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      alert('구글 로그인에 실패했어요. 다시 시도해 주세요.');
      router.replace('/');
      return;
    }

    if (!code) return;

    console.warn('[AuthCallback] authCode:', code);
  }, [router, searchParams]);

  return (
    <main className="flex min-h-dvh items-center justify-center px-6">
      <p className="text-sm text-neutral-600">로그인 처리 중...</p>
    </main>
  );
}
