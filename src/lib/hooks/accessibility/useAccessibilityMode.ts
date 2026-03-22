'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const ACCESSIBILITY_KEY = 'accessibility_mode';

export function useAccessibilityMode() {
  const [isOn, setIsOn] = useState(false);
  // 초기 마운트 시 클래스 관리 effect를 건너뛰기 위한 플래그
  // (인라인 스크립트가 이미 초기 상태를 적용하므로 중복 제거 방지)
  const isFirstRun = useRef(true);

  // 하이드레이션 후 localStorage에서 초기값 읽기
  useEffect(() => {
    setIsOn(localStorage.getItem(ACCESSIBILITY_KEY) === 'true');
  }, []);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
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
