'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import BaseModal from '@/components/common/BaseModal';
import TodoCreateModal from '@/components/todo/TodoCreateModal';
import TodoEditModal from '@/components/todo/TodoEditModal';
import TodoItemRow from '@/components/todo/TodoItemRow';
import { createTodo, deleteTodo, listTodos, updateTodo, updateTodoStatus } from '@/lib/api/todos';
import { getSeoulToday } from '@/lib/datetime/format';
import { calcCompletionProgress } from '@/lib/utils/progress';

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
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Todo | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Todo | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const requestIdRef = useRef(0);

  const targetDate = dateFilter ?? getSeoulToday();
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
  const { percent } = calcCompletionProgress(todayTodos);

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

  const handleRequestEdit = useCallback(
    (todoId: string) => {
      const target = localTodos.find((todo) => todo.todoId === todoId);
      if (!target) return;
      setEditTarget(target);
      setIsEditOpen(true);
    },
    [localTodos],
  );

  const handleEditTodo = useCallback(
    async (payload: { todoId: string; title: string; dueDate: LocalDateString }) => {
      const result = await updateTodo(payload.todoId, {
        title: payload.title,
        dueDate: payload.dueDate,
      });

      if (!result.ok) {
        return {
          ok: false,
          message: result.message ?? '수정에 실패했습니다.',
        };
      }

      setLocalTodos((prev) => {
        const updated = prev.map((todo) =>
          todo.todoId === payload.todoId
            ? { ...todo, title: payload.title, dueDate: payload.dueDate }
            : todo,
        );

        if (isDateFilterActive && payload.dueDate !== targetDate) {
          return updated.filter((todo) => todo.todoId !== payload.todoId);
        }

        return updated;
      });

      if (!todosProp) {
        await fetchTodos();
      }

      return { ok: true };
    },
    [fetchTodos, isDateFilterActive, targetDate, todosProp],
  );

  const handleRequestDelete = useCallback(
    (todoId: string) => {
      const target = localTodos.find((todo) => todo.todoId === todoId);
      if (!target) return;
      setDeleteTarget(target);
      setDeleteError(null);
      setIsDeleteOpen(true);
    },
    [localTodos],
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget || isDeleting) return;

    const snapshot = localTodos;
    setIsDeleting(true);
    setDeleteError(null);
    setLocalTodos((prev) => prev.filter((todo) => todo.todoId !== deleteTarget.todoId));

    try {
      const result = await deleteTodo(deleteTarget.todoId);
      if (!result.ok) {
        setLocalTodos(snapshot);
        setDeleteError(result.message ?? '삭제에 실패했습니다.');
        return;
      }

      setIsDeleteOpen(false);
      setDeleteTarget(null);

      if (!todosProp) {
        await fetchTodos();
      }
    } catch {
      setLocalTodos(snapshot);
      setDeleteError('삭제에 실패했습니다.');
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget, fetchTodos, isDeleting, localTodos, todosProp]);

  const handleOpenCreate = useCallback(() => {
    onAddClick?.();
    setIsCreateOpen(true);
  }, [onAddClick]);

  const handleCloseEdit = useCallback(() => {
    setIsEditOpen(false);
    setEditTarget(null);
  }, []);

  return (
    <section className="rounded-2xl bg-white px-5 py-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-black">{title}</h3>
          <span className="rounded-full bg-[#05C075]/10 px-2 py-1 text-xs font-semibold text-[#05C075]">
            {percent}% 완료
          </span>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="flex h-9 items-center gap-1 rounded-full bg-[#05C075] px-4 text-sm font-semibold text-white shadow-[0_6px_14px_rgba(5,192,117,0.35)] transition-all hover:bg-[#04A865]"
          aria-label="할 일 추가"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          추가
        </button>
      </div>

      <div
        className="mt-4 h-2.5 w-full rounded-full bg-black/5"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        <div
          className="h-full rounded-full bg-[#05C075] transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="mt-5 space-y-3">
        {isLoading ? (
          <>
            {[0, 1, 2].map((idx) => (
              <div
                key={idx}
                className="flex w-full items-center gap-3 rounded-xl border border-black/5 bg-white px-4 py-3"
              >
                <div className="h-5 w-5 animate-pulse rounded-full bg-black/10" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-black/10" />
              </div>
            ))}
            <span className="text-xs text-black/40">불러오는 중...</span>
          </>
        ) : errorMessage ? (
          <p className="text-sm text-black/50">{errorMessage}</p>
        ) : todayTodos.length === 0 ? (
          <p className="text-xs text-black/40">오늘 할 일이 없어요</p>
        ) : (
          scheduledIncomplete.map((todo) => (
            <TodoItemRow
              key={todo.todoId}
              todoId={todo.todoId}
              title={todo.title}
              isCompleted={todo.isCompleted}
              onToggle={handleToggle}
              onClick={onTodoClick}
              onEdit={handleRequestEdit}
              onDelete={handleRequestDelete}
            />
          ))
        )}
      </div>

      {!isLoading && !errorMessage && scheduledCompleted.length > 0 ? (
        <div className="mt-5 space-y-3">
          {scheduledCompleted.map((todo) => (
            <TodoItemRow
              key={todo.todoId}
              todoId={todo.todoId}
              title={todo.title}
              isCompleted={todo.isCompleted}
              onToggle={handleToggle}
              onClick={onTodoClick}
              onEdit={handleRequestEdit}
              onDelete={handleRequestDelete}
            />
          ))}
        </div>
      ) : null}

      {!isLoading && !errorMessage && otherTodos.length > 0 ? (
        <div className="mt-6 border-t border-black/5 pt-4">
          <p className="mb-3 text-xs font-semibold text-black/50">오늘 외 일정</p>
          <div className="space-y-3">
            {otherTodos.map((todo) => (
              <TodoItemRow
                key={todo.todoId}
                todoId={todo.todoId}
                title={todo.title}
                meta={todo.dueDate ?? ''}
                isCompleted={todo.isCompleted}
                onToggle={handleToggle}
                onClick={onTodoClick}
                onEdit={handleRequestEdit}
                onDelete={handleRequestDelete}
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

      <TodoEditModal
        open={isEditOpen}
        onClose={handleCloseEdit}
        todo={editTarget}
        onSubmit={handleEditTodo}
      />

      <BaseModal open={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="할 일 삭제">
        <div className="mt-4 space-y-4">
          <p className="text-sm text-neutral-600">
            {deleteTarget?.title ? `"${deleteTarget.title}"` : '이 항목'}을(를) 삭제할까요?
          </p>
          {deleteError ? <p className="text-xs text-red-500">{deleteError}</p> : null}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsDeleteOpen(false)}
              className="h-11 flex-1 rounded-xl border border-neutral-300 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="h-11 flex-1 rounded-xl bg-red-600 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isDeleting ? '삭제 중...' : '삭제'}
            </button>
          </div>
        </div>
      </BaseModal>
    </section>
  );
}
