import { cn } from '@/lib/utils';

type TodoItemRowProps = {
  title: string;
  isCompleted: boolean;
  onToggle?: () => void;
  onClick?: () => void;
};

export default function TodoItemRow({ title, isCompleted, onToggle, onClick }: TodoItemRowProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onToggle}
        role="checkbox"
        aria-checked={isCompleted}
        className={cn(
          'flex h-5 w-5 items-center justify-center rounded-full border transition-colors',
          isCompleted
            ? 'border-neutral-300 bg-neutral-300 text-white'
            : 'border-neutral-300 bg-white text-transparent',
        )}
      >
        <span className={cn('text-[11px] font-bold', isCompleted ? 'opacity-100' : 'opacity-0')}>
          ✓
        </span>
      </button>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'flex-1 text-left text-sm transition-colors',
          isCompleted ? 'text-neutral-400 line-through' : 'text-neutral-900',
        )}
      >
        {title}
      </button>
    </div>
  );
}
