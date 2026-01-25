'use client';

import { cn } from '@/lib/utils';

export type InterestOption<T extends string = string> = {
  value: T;
  label: string;
};

type InterestChipsProps<T extends string> = {
  options: readonly InterestOption<T>[];
  selected?: readonly T[];
  onToggle?: (value: T) => void;
};

export default function InterestChips<T extends string>({
  options,
  selected = [],
  onToggle,
}: InterestChipsProps<T>) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {options.map(({ value, label }) => {
        const isActive = selected.includes(value);

        return (
          <button
            key={value}
            type="button"
            onClick={() => onToggle?.(value)}
            className={cn(
              'inline-flex h-9 w-full items-center justify-center rounded-full border text-sm leading-none font-medium transition',
              isActive
                ? 'border-zinc-900 bg-zinc-900 text-white'
                : 'border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50',
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
