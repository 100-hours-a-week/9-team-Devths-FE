'use client';

import { createContext, useContext } from 'react';

import type { ReactNode } from 'react';

type HeaderOptions = {
  title?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  rightSlot?: ReactNode;
};

type HeaderContextValue = {
  options: HeaderOptions;
  setOptions: (options: HeaderOptions) => void;
  resetOptions: () => void;
  defaultOptions: HeaderOptions;
};

export const HeaderContext = createContext<HeaderContextValue | null>(null);

export function useHeader() {
  const context = useContext(HeaderContext);
  if (!context) {
    throw new Error('useHeader must be used within AppFrame');
  }
  return context;
}

export type { HeaderOptions };
