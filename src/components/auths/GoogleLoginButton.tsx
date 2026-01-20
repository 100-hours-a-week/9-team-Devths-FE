import Image from 'next/image';

import type { ButtonHTMLAttributes } from 'react';

type GoogleLoginButtonProps = {
  fullWidth?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export default function GoogleLoginButton({
  fullWidth = true,
  disabled,
  className,
  ...props
}: GoogleLoginButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={[
        fullWidth ? 'w-full' : 'w-auto',
        'max-w-sm',

        'rounded-xl border border-neutral-200',

        'px-4 py-3',

        'text-sm font-medium',

        'bg-white hover:bg-neutral-50 active:bg-neutral-100',
        'disabled:cursor-not-allowed disabled:opacity-60',

        className ?? '',
      ].join(' ')}
      {...props}
    >
      <span className="flex items-center justify-center gap-2">
        <Image src="/icons/google.png" alt="Google" width={18} height={18} priority />
        <span>Sign in with Google</span>
      </span>
    </button>
  );
}
