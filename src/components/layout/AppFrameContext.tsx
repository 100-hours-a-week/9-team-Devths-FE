'use client';

import { createContext, useContext } from 'react';

type AppFrameOptions = {
  showBottomNav: boolean;
};

type AppFrameContextValue = {
  options: AppFrameOptions;
  setOptions: (options: AppFrameOptions) => void;
  resetOptions: () => void;
  defaultOptions: AppFrameOptions;
};

export const AppFrameContext = createContext<AppFrameContextValue | null>(null);

export function useAppFrame() {
  const context = useContext(AppFrameContext);
  if (!context) {
    throw new Error('useAppFrame must be used within AppFrame');
  }
  return context;
}

export type { AppFrameOptions };
