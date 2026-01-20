'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import { postGoogleAuth } from '@/lib/api/auth';

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

    const run = async () => {
      try {
        const { res, json } = await postGoogleAuth(code);

        if (!res.ok || !json) {
          alert('로그인 서버가 아직 연결되지 않았어요. (백엔드 준비 후 다시 시도)');
          router.replace('/');
          return;
        }
      } catch {
        alert('로그인 처리 중 오류가 발생했어요.');
        router.replace('/');
      }
    };

    run();
  }, [router, searchParams]);

  return (
    <main className="flex min-h-dvh items-center justify-center px-6">
      <p className="text-sm text-neutral-600">로그인 처리 중...</p>
    </main>
  );
}
