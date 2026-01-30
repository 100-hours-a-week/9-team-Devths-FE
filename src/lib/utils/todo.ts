import type { Todo } from '@/types/todo';

export type TodoProgress = {
  completedCount: number;
  totalCount: number;
  percent: number;
};

export function calcProgress(todos: Todo[]): TodoProgress {
  const totalCount = todos.length;
  const completedCount = todos.filter((todo) => todo.isCompleted).length;
  const rawPercent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
  const percent = Math.min(100, Math.max(0, rawPercent));

  return { completedCount, totalCount, percent };
}
