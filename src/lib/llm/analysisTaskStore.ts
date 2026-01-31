'use client';

import { create } from 'zustand';

import type { LlmModel, TaskStatus } from '@/types/llm';

type AnalysisTask = {
  taskId: number;
  roomId: number;
  roomUuid: string;
  roomTitle: string;
  status: TaskStatus;
  model: LlmModel;
  startedAt: number;
};

type AnalysisTaskState = {
  activeTask: AnalysisTask | null;
  setActiveTask: (task: AnalysisTask) => void;
  updateStatus: (status: TaskStatus) => void;
  clearActiveTask: () => void;
};

export const useAnalysisTaskStore = create<AnalysisTaskState>((set) => ({
  activeTask: null,
  setActiveTask: (task) => set({ activeTask: task }),
  updateStatus: (status) =>
    set((state) => (state.activeTask ? { activeTask: { ...state.activeTask, status } } : state)),
  clearActiveTask: () => set({ activeTask: null }),
}));
