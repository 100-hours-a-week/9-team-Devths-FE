'use client';

import { createContext, useContext } from 'react';

type NavigationGuardContextValue = {
  isBlocked: boolean;
  setBlocked: (blocked: boolean) => void;
  requestNavigation: (action: () => void) => void;
};

const NavigationGuardContext = createContext<NavigationGuardContextValue | null>(null);

export function useNavigationGuard(): NavigationGuardContextValue {
  const context = useContext(NavigationGuardContext);
  if (context) return context;

  return {
    isBlocked: false,
    setBlocked: () => {},
    requestNavigation: (action: () => void) => action(),
  };
}

export { NavigationGuardContext };
