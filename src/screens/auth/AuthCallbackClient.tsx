'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { postGoogleAuth } from '@/lib/api/auth';
import { setAccessToken, setSignupEmail, setTempToken } from '@/lib/auth/token';

export default function AuthCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const didRunRef = useRef(false);

  useEffect(() => {
    if (didRunRef.current) return;
    didRunRef.current = true;

    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      alert('구글 로그인에 실패했어요. 다시 시도해 주세요.');
      router.replace('/');
      return;
    }

    if (!code) {
      alert('인가 코드(code)가 없어요. 다시 로그인 해주세요.');
      router.replace('/');
      return;
    }

    const run = async () => {
      try {
        const { ok, status, json, accessToken } = await postGoogleAuth(code);

        if (!ok) {
          const msg =
            (json && 'message' in json && typeof json.message === 'string' && json.message) ||
            `로그인 실패 (HTTP ${status})`;

          alert(msg);
          router.replace('/');
          return;
        }

        if (!json || !('data' in json) || !json.data) {
          alert('로그인 응답을 해석하지 못했어요. (응답 형식 확인 필요)');
          router.replace('/');
          return;
        }

        if (json.data.isRegistered) {
          if (!accessToken) {
            alert('accessToken을 받지 못했어요. (응답 헤더 Authorization 확인 필요)');
            router.replace('/');
            return;
          }

          setAccessToken(accessToken);
          router.replace('/llm');
          return;
        }

        // 비회원: 회원가입 컨텍스트 저장
        setTempToken(json.data.tempToken);
        setSignupEmail(json.data.email);
        router.replace('/signup');
      } catch (err) {
        console.warn(err);
        alert('로그인 처리 중 오류가 발생했어요. (서버/네트워크 상태 확인)');
        router.replace('/');
      }
    };

    void run();
  }, [router, searchParams]);

  return (
    <main className="flex min-h-dvh items-center justify-center px-6">
      <p className="text-sm text-neutral-600">로그인 처리 중...</p>
    </main>
  );
}
