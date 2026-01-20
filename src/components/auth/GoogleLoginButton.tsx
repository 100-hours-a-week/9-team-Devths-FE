'use client';

import Image from 'next/image';

import type { ButtonHTMLAttributes, MouseEventHandler } from 'react';

type GoogleLoginButtonProps = {
  fullWidth?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export default function GoogleLoginButton({
  fullWidth = true,
  disabled,
  className,
  onClick,
  ...props
}: GoogleLoginButtonProps) {
  const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    onClick?.(e);

    if (e.defaultPrevented) return;

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '';
    const redirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI ?? '';

    if (!clientId) {
      alert('NEXT_PUBLIC_GOOGLE_CLIENT_ID가 설정되지 않았어요. (.env.local 확인)');
      return;
    }
    if (!redirectUri) {
      alert('NEXT_PUBLIC_GOOGLE_REDIRECT_URI가 설정되지 않았어요. (.env.local 확인)');
      return;
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
    });

    window.location.assign(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleClick}
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
