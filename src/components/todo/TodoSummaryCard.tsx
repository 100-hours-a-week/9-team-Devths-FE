'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import TodoCreateModal from '@/components/todo/TodoCreateModal';
import TodoItemRow from '@/components/todo/TodoItemRow';
import { createTodo, listTodos, updateTodoStatus } from '@/lib/api/todos';
import { toLocalDate } from '@/lib/datetime/seoul';
import { calcProgress } from '@/lib/utils/todo';

import type { LocalDateString } from '@/types/calendar';
import type { Todo } from '@/types/todo';

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
  const [localTodos, setLocalTodos] = useState<Todo[]>(todosProp ?? []);
  const [isLoading, setIsLoading] = useState(!todosProp);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const requestIdRef = useRef(0);

  const targetDate = dateFilter ?? toLocalDate(new Date());
  const isDateFilterActive = Boolean(dateFilter);

  useEffect(() => {
    if (todosProp) {
      setLocalTodos(todosProp);
      setIsLoading(false);
      setErrorMessage(null);
    }
  }, [todosProp]);

  const fetchTodos = useCallback(async () => {
    if (todosProp) return;

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await listTodos(isDateFilterActive ? targetDate : undefined);
      if (requestIdRef.current !== requestId) return;

      if (!result.ok) {
        setLocalTodos([]);
        setErrorMessage('목록을 불러오지 못했어요');
        return;
      }

      setLocalTodos(result.data ?? []);
    } catch {
      if (requestIdRef.current !== requestId) return;
      setLocalTodos([]);
      setErrorMessage('목록을 불러오지 못했어요');
    } finally {
      if (requestIdRef.current === requestId) {
        setIsLoading(false);
      }
    }
  }, [isDateFilterActive, targetDate, todosProp]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const todayTodos = useMemo(() => {
    if (isDateFilterActive) {
      return localTodos;
    }

    return localTodos.filter((todo) => todo.dueDate === targetDate);
  }, [isDateFilterActive, localTodos, targetDate]);
  const scheduledIncomplete = useMemo(
    () => todayTodos.filter((todo) => !todo.isCompleted),
    [todayTodos],
  );
  const scheduledCompleted = useMemo(
    () => todayTodos.filter((todo) => todo.isCompleted),
    [todayTodos],
  );
  const otherTodos = useMemo(() => {
    if (isDateFilterActive) return [];
    return localTodos.filter((todo) => todo.dueDate && todo.dueDate !== targetDate);
  }, [isDateFilterActive, localTodos, targetDate]);
  const { percent } = calcProgress(todayTodos);

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

  const handleCreateTodo = useCallback(
    async (payload: { title: string; dueDate: LocalDateString }) => {
      const result = await createTodo(payload);

      if (!result.ok) {
        return {
          ok: false,
          message: result.message ?? '추가에 실패했습니다.',
        };
      }

      await fetchTodos();
      return { ok: true };
    },
    [fetchTodos],
  );

  const handleOpenCreate = useCallback(() => {
    onAddClick?.();
    setIsCreateOpen(true);
  }, [onAddClick]);

  return (
    <section className="bg-white py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold text-[#151515]">{title}</h3>
          <span className="text-xs font-medium text-neutral-500">{percent}% 완료</span>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="flex h-9 items-center gap-1 rounded-lg bg-[#05C075] px-4 text-sm font-medium text-white transition-all hover:bg-[#04A865]"
          aria-label="할 일 추가"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          추가
        </button>
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
        {isLoading ? (
          <>
            {[0, 1, 2].map((idx) => (
              <div
                key={idx}
                className="flex w-full items-center gap-3 rounded-lg border border-neutral-200 bg-white px-3 py-2"
              >
                <div className="h-5 w-5 animate-pulse rounded-full bg-neutral-200" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-neutral-200" />
              </div>
            ))}
            <span className="text-xs text-neutral-400">불러오는 중...</span>
          </>
        ) : errorMessage ? (
          <p className="text-sm text-neutral-500">{errorMessage}</p>
        ) : todayTodos.length === 0 ? (
          <p className="text-xs text-neutral-400">오늘 할 일이 없어요</p>
        ) : (
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
        )}
      </div>

      {!isLoading && !errorMessage && scheduledCompleted.length > 0 ? (
        <div className="mt-4 space-y-3">
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
      ) : null}

      {!isLoading && !errorMessage && otherTodos.length > 0 ? (
        <div className="mt-5 border-t border-neutral-100 pt-4">
          <p className="mb-3 text-xs font-semibold text-neutral-500">오늘 외 일정</p>
          <div className="space-y-3">
            {otherTodos.map((todo) => (
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

      <TodoCreateModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        defaultDueDate={targetDate}
        onSubmit={handleCreateTodo}
      />
    </section>
  );
}
