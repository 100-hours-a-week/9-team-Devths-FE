'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import BaseModal from '@/components/common/BaseModal';
import { deleteUser } from '@/lib/api/users';
import { clearAccessToken } from '@/lib/auth/token';

type WithdrawModalProps = {
  open: boolean;
  onClose: () => void;
  nickname: string;
};

export default function WithdrawModal({ open, onClose, nickname }: WithdrawModalProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [inputValue, setInputValue] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirmPhrase = `탈퇴하겠습니다/${nickname}`;
  const isMatch = inputValue === confirmPhrase;

  const handleClose = () => {
    if (isComplete) return; // 완료 상태에서는 닫기 방지
    setInputValue('');
    setError(null);
    onClose();
  };

  const handleWithdraw = async () => {
    if (!isMatch || isPending) return;

    setIsPending(true);
    setError(null);

    try {
      const result = await deleteUser();

      if (!result.ok) {
        throw new Error('탈퇴에 실패했습니다.');
      }

      // 토큰/캐시 초기화
      clearAccessToken();
      queryClient.clear();

      // 완료 상태로 전환
      setIsComplete(true);
    } catch {
      setError('탈퇴 처리 중 오류가 발생했습니다.');
    } finally {
      setIsPending(false);
    }
  };

  const handleGoHome = () => {
    router.push('/');
  };

  if (!open) return null;

  // 탈퇴 완료 화면
  if (isComplete) {
    return (
      <BaseModal open={open} onClose={() => {}} title="탈퇴 완료">
        <div className="mt-4 flex flex-col items-center gap-6">
          <p className="text-center text-sm text-neutral-600">
            회원 탈퇴가 완료되었습니다.
            <br />
            그동안 이용해 주셔서 감사합니다.
          </p>

          <button
            type="button"
            onClick={handleGoHome}
            className="h-12 w-full rounded-xl bg-neutral-900 text-sm font-semibold text-white hover:bg-neutral-800"
          >
            홈으로 돌아가기
          </button>
        </div>
      </BaseModal>
    );
  }

  // 탈퇴 확인 화면
  return (
    <BaseModal open={open} onClose={handleClose} title="회원 탈퇴">
      <div className="mt-4 flex flex-col gap-4">
        <p className="text-sm text-neutral-600">
          탈퇴를 원하시면 아래 문구를 정확히 입력해 주세요.
        </p>

        <div className="rounded-lg bg-neutral-100 px-3 py-2 text-center text-sm font-medium text-neutral-700">
          {confirmPhrase}
        </div>

        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="위 문구를 입력하세요"
          className="h-12 w-full rounded-xl border border-neutral-300 px-4 text-sm focus:border-neutral-900 focus:outline-none"
        />

        {error && <p className="text-center text-xs text-red-500">{error}</p>}

        <button
          type="button"
          onClick={handleWithdraw}
          disabled={!isMatch || isPending}
          className="h-12 w-full rounded-xl bg-red-600 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? '탈퇴 처리 중...' : '탈퇴하기'}
        </button>
      </div>
    </BaseModal>
  );
}
