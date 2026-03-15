'use client';

import { useCallback, useEffect, useState } from 'react';

const ACCESSIBILITY_KEY = 'accessibility_mode';

export function useAccessibilityMode() {
  const [isOn, setIsOn] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(ACCESSIBILITY_KEY) === 'true';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isOn) {
      root.classList.add('accessibility-mode');
      localStorage.setItem(ACCESSIBILITY_KEY, 'true');
    } else {
      root.classList.remove('accessibility-mode');
      localStorage.setItem(ACCESSIBILITY_KEY, 'false');
    }
  }, [isOn]);

  const toggle = useCallback(() => setIsOn((prev) => !prev), []);

  return { isOn, toggle };
}
