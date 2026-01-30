import type { LocalDateString } from './calendar';

export type Todo = {
  todoId: string;
  title: string;
  isCompleted: boolean;
  dueDate: LocalDateString | null;
};

export type TodoCreateRequest = {
  title: string;
  dueDate: LocalDateString;
};

export type TodoUpdateRequest = {
  title: string;
  dueDate: LocalDateString;
};

export type TodoStatusUpdateRequest = {
  isCompleted: boolean;
};
