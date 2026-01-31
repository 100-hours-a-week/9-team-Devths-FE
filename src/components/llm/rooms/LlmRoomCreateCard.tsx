'use client';

import { Plus } from 'lucide-react';
import Link from 'next/link';

type Props = {
  href: string;
  disabled?: boolean;
  onDisabledClick?: () => void;
};

export default function LlmRoomCreateCard({ href, disabled, onDisabledClick }: Props) {
  return (
    <Link
      href={href}
      onClick={(event) => {
        if (!disabled) return;
        event.preventDefault();
        event.stopPropagation();
        onDisabledClick?.();
      }}
      aria-disabled={disabled}
      className={[
        'flex items-center justify-between rounded-2xl px-5 py-4 transition-colors',
        disabled
          ? 'cursor-not-allowed bg-[#F4F5F7] opacity-60'
          : 'bg-[#05C075] active:bg-[#049e61]',
      ].join(' ')}
    >
      <div className="flex flex-col gap-0.5">
        <span
          className={[
            'text-[17px] font-bold',
            disabled ? 'text-[#ADB5BD]' : 'text-white',
          ].join(' ')}
        >
          새 대화 시작
        </span>
        <span
          className={[
            'text-[13px]',
            disabled ? 'text-[#ADB5BD]' : 'text-white/80',
          ].join(' ')}
        >
          AI와 함께 분석해보세요
        </span>
      </div>

      <div
        className={[
          'inline-flex h-11 w-11 items-center justify-center rounded-full',
          disabled ? 'bg-[#E5E8EB]' : 'bg-white/20',
        ].join(' ')}
      >
        <Plus
          className={disabled ? 'h-6 w-6 text-[#ADB5BD]' : 'h-6 w-6 text-white'}
          strokeWidth={2.5}
        />
      </div>
    </Link>
  );
}
