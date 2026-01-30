import { cn } from '@/lib/utils';

type TodoItemRowProps = {
  todoId: string;
  title: string;
  isCompleted: boolean;
  onToggle?: (todoId: string) => void;
  onClick?: (todoId: string) => void;
};

export default function TodoItemRow({
  todoId,
  title,
  isCompleted,
  onToggle,
  onClick,
}: TodoItemRowProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onToggle?.(todoId)}
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
        onClick={() => onClick?.(todoId)}
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
