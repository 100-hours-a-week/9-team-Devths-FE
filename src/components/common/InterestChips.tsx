'use client';

import { cn } from '@/lib/utils';

type InterestChipsProps = {
  options: string[];
  selected?: string[];
  onToggle?: (label: string) => void;
};

export default function InterestChips({ options, selected = [], onToggle }: InterestChipsProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {options.map((label: string) => {
        const isActive = selected.includes(label);

        return (
          <button
            key={label}
            type="button"
            onClick={() => onToggle?.(label)}
            className={cn(
              'h-9 w-full rounded-full border text-sm font-medium transition',
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
