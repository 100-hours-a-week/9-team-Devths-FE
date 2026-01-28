'use client';

import { useState } from 'react';

import BaseModal from '@/components/common/BaseModal';

type WithdrawModalProps = {
  open: boolean;
  onClose: () => void;
  nickname: string;
};

export default function WithdrawModal({ open, onClose, nickname }: WithdrawModalProps) {
  const [inputValue, setInputValue] = useState('');

  const confirmPhrase = `탈퇴하겠습니다/${nickname}`;
  const isMatch = inputValue === confirmPhrase;

  const handleClose = () => {
    setInputValue('');
    onClose();
  };

  if (!open) return null;

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

        <button
          type="button"
          disabled={!isMatch}
          className="h-12 w-full rounded-xl bg-red-600 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          탈퇴하기
        </button>
      </div>
    </BaseModal>
  );
}
