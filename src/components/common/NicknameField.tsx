'use client';

import { cn } from '@/lib/utils';

type NicknameFieldProps = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  errorMessage?: string | null;
};

export default function NicknameField({
  value,
  onChange,
  placeholder = '닉네임을 입력해주세요(2~10자)',
  errorMessage,
}: NicknameFieldProps) {
  const hasError = Boolean(errorMessage);

  return (
    <div className="w-full">
      <label htmlFor="nickname-field" className="text-sm font-semibold">닉네임</label>

      <div className="mt-3">
        <input
          id="nickname-field"
          aria-describedby="nickname-field-message"
          aria-invalid={hasError}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'h-12 w-full rounded-xl border px-4 text-base outline-none',
            'bg-background placeholder:text-muted-foreground',
            'focus:ring-2',
            hasError
              ? 'border-destructive focus:border-destructive focus:ring-destructive/20'
              : 'border-input focus:border-[#05C075] focus:ring-[#05C075]/20',
          )}
        />
      </div>

      <p
        id="nickname-field-message"
        role={hasError ? 'alert' : undefined}
        className={cn(
          'mt-2 min-h-[16px] text-[11px] leading-4',
          hasError ? 'text-destructive' : 'text-muted-foreground',
        )}
      >
        {errorMessage ?? ''}
      </p>
    </div>
  );
}
