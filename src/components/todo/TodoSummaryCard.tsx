'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import TodoItemRow from '@/components/todo/TodoItemRow';
import { updateTodoStatus } from '@/lib/api/todos';
import { toLocalDate } from '@/lib/datetime/seoul';
import { calcProgress } from '@/lib/utils/todo';

import type { LocalDateString } from '@/types/calendar';
import type { Todo } from '@/types/todo';

function buildMockTodos(today: LocalDateString): Todo[] {
  return [
    {
      todoId: 'mock-1',
      title: '포트폴리오 문서 정리',
      isCompleted: true,
      dueDate: today,
    },
    {
      todoId: 'mock-2',
      title: '면접 질문 리스트 보완',
      isCompleted: false,
      dueDate: today,
    },
    {
      todoId: 'mock-3',
      title: '프로젝트 회고 작성',
      isCompleted: false,
      dueDate: null,
    },
  ];
}

type TodoSummaryCardProps = {
  title?: string;
  todos?: Todo[];
  dateFilter?: LocalDateString;
  onAddClick?: () => void;
  onToggleTodo?: (todoId: string) => void;
  onTodoClick?: (todoId: string) => void;
};

export default function TodoSummaryCard({
  title = '오늘 할 일',
  todos: todosProp,
  dateFilter,
  onAddClick,
  onToggleTodo,
  onTodoClick,
}: TodoSummaryCardProps) {
  const initialTodos = useMemo(() => buildMockTodos(toLocalDate(new Date())), []);
  const [localTodos, setLocalTodos] = useState<Todo[]>(todosProp ?? initialTodos);

  useEffect(() => {
    if (todosProp) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocalTodos(todosProp);
    }
  }, [todosProp]);

  const targetDate = dateFilter ?? toLocalDate(new Date());
  const scheduledTodos = useMemo(
    () => localTodos.filter((todo) => todo.dueDate === targetDate),
    [localTodos, targetDate],
  );
  const scheduledIncomplete = useMemo(
    () => scheduledTodos.filter((todo) => !todo.isCompleted),
    [scheduledTodos],
  );
  const scheduledCompleted = useMemo(
    () => scheduledTodos.filter((todo) => todo.isCompleted),
    [scheduledTodos],
  );
  const unscheduledTodos = useMemo(
    () => localTodos.filter((todo) => todo.dueDate === null),
    [localTodos],
  );
  const { percent } = calcProgress(scheduledTodos);

  const handleToggle = useCallback(
    async (todoId: string) => {
      if (onToggleTodo) {
        onToggleTodo(todoId);
        return;
      }

      const target = localTodos.find((todo) => todo.todoId === todoId);
      if (!target) return;

      const nextIsCompleted = !target.isCompleted;

      setLocalTodos((prev) =>
        prev.map((todo) =>
          todo.todoId === todoId ? { ...todo, isCompleted: nextIsCompleted } : todo,
        ),
      );

      try {
        const result = await updateTodoStatus(todoId, { isCompleted: nextIsCompleted });

        if (!result.ok) {
          setLocalTodos((prev) =>
            prev.map((todo) =>
              todo.todoId === todoId ? { ...todo, isCompleted: target.isCompleted } : todo,
            ),
          );
        }
      } catch {
        setLocalTodos((prev) =>
          prev.map((todo) =>
            todo.todoId === todoId ? { ...todo, isCompleted: target.isCompleted } : todo,
          ),
        );
      }
    },
    [localTodos, onToggleTodo],
  );

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white px-4 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-neutral-900">{title}</h3>
          <button
            type="button"
            onClick={onAddClick}
            className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-neutral-200 text-sm text-neutral-500"
            aria-label="할 일 추가"
          >
            +
          </button>
        </div>
        <span className="text-xs font-medium text-neutral-500">{percent}% 완료</span>
      </div>

      <div
        className="mt-3 h-2 w-full rounded-full bg-neutral-100"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        <div
          className="h-full rounded-full bg-neutral-300 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="mt-4 space-y-3">
        {scheduledIncomplete.length > 0 ? (
          scheduledIncomplete.map((todo) => (
            <TodoItemRow
              key={todo.todoId}
              todoId={todo.todoId}
              title={todo.title}
              isCompleted={todo.isCompleted}
              onToggle={handleToggle}
              onClick={onTodoClick}
            />
          ))
        ) : (
          <p className="text-xs text-neutral-400">오늘 할 일이 없어요</p>
        )}
      </div>

      {scheduledCompleted.length > 0 ? (
        <div className="mt-5 border-t border-neutral-100 pt-4">
          <p className="mb-3 text-xs font-semibold text-neutral-500">완료됨</p>
          <div className="space-y-3">
            {scheduledCompleted.map((todo) => (
              <TodoItemRow
                key={todo.todoId}
                todoId={todo.todoId}
                title={todo.title}
                isCompleted={todo.isCompleted}
                onToggle={handleToggle}
                onClick={onTodoClick}
              />
            ))}
          </div>
        </div>
      ) : null}

      {unscheduledTodos.length > 0 ? (
        <div className="mt-5 border-t border-neutral-100 pt-4">
          <p className="mb-3 text-xs font-semibold text-neutral-500">날짜 미정</p>
          <div className="space-y-3">
            {unscheduledTodos.map((todo) => (
              <TodoItemRow
                key={todo.todoId}
                todoId={todo.todoId}
                title={todo.title}
                isCompleted={todo.isCompleted}
                onToggle={handleToggle}
                onClick={onTodoClick}
              />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
