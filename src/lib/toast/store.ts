import { create } from 'zustand';

type Toast = {
  id: string;
  message: string;
};

type ToastState = {
  toasts: Toast[];
  show: (message: string) => void;
  remove: (id: string) => void;
  clear: () => void;
};

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  show: (message) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    set((state) => ({ toasts: [...state.toasts, { id, message }] }));

    setTimeout(() => {
      useToastStore.getState().remove(id);
    }, 2000);
  },

  remove: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
  clear: () => set({ toasts: [] }),
}));

export function toast(message: string) {
  useToastStore.getState().show(message);
}
