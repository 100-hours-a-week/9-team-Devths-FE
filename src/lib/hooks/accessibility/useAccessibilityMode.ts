'use client';

import { useCallback, useEffect, useSyncExternalStore } from 'react';

const ACCESSIBILITY_KEY = 'accessibility_mode';
const CHANGE_EVENT = 'accessibility-mode-change';

function subscribe(callback: () => void) {
  window.addEventListener(CHANGE_EVENT, callback);
  return () => window.removeEventListener(CHANGE_EVENT, callback);
}

function getSnapshot() {
  return localStorage.getItem(ACCESSIBILITY_KEY) === 'true';
}

function getServerSnapshot() {
  return false;
}

export function useAccessibilityMode() {
  const isOn = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    const root = document.documentElement;
    if (isOn) {
      root.classList.add('accessibility-mode');
    } else {
      root.classList.remove('accessibility-mode');
    }
  }, [isOn]);

  const toggle = useCallback(() => {
    const next = !(localStorage.getItem(ACCESSIBILITY_KEY) === 'true');
    localStorage.setItem(ACCESSIBILITY_KEY, String(next));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  return { isOn, toggle };
}
