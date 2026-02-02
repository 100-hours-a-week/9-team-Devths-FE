'use client';

import * as React from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type PrimaryButtonProps = React.ComponentProps<typeof Button>;

export default function PrimaryButton({ className, disabled, ...props }: PrimaryButtonProps) {
  return (
    <Button
      {...props}
      disabled={disabled}
      className={cn(
        'h-14 w-full rounded-full text-base font-semibold',
        disabled
          ? 'bg-zinc-300 text-white hover:bg-zinc-300'
          : 'bg-[#05C075] text-white hover:bg-[#05C075]/90',
        className,
      )}
    />
  );
}
