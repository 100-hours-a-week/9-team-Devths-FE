'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

import type { Metric } from 'web-vitals';

/**
 * Web Vitals 메트릭을 수집하고 서버로 전송하는 컴포넌트
 *
 * 다음 메트릭을 측정합니다:
 * - LCP (Largest Contentful Paint): 가장 큰 콘텐츠가 렌더링되는 시간
 * - CLS (Cumulative Layout Shift): 레이아웃 이동 누적 점수
 * - FCP (First Contentful Paint): 첫 번째 콘텐츠가 렌더링되는 시간
 * - TTFB (Time to First Byte): 서버 응답 시간
 * - INP (Interaction to Next Paint): 사용자 상호작용 응답성
 */
export default function WebVitalsReporter() {
  const pathname = usePathname();

  useEffect(() => {
    // web-vitals 라이브러리를 동적으로 import
    import('web-vitals').then(({ onCLS, onFCP, onINP, onLCP, onTTFB }) => {
      const sendMetric = (metric: Metric) => {
        // 메트릭 rating 계산 (Good, Needs Improvement, Poor)
        const rating = getRating(metric);

        // 서버로 메트릭 전송
        fetch('/api/web-vitals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: metric.name,
            value: metric.value,
            rating,
            page: pathname || 'unknown',
          }),
          // keepalive를 사용하여 페이지 이탈 시에도 전송 보장
          keepalive: true,
        }).catch((error) => {
          // 실패해도 사용자 경험에 영향을 주지 않도록 조용히 처리
          console.warn('Failed to send web vital:', error);
        });
      };

      // 각 메트릭 측정 시작
      onCLS(sendMetric);
      onFCP(sendMetric);
      onINP(sendMetric);
      onLCP(sendMetric);
      onTTFB(sendMetric);
    });
  }, [pathname]);

  // 렌더링하지 않음 (메트릭 수집만 수행)
  return null;
}

/**
 * Web Vitals 메트릭의 rating을 계산합니다.
 * Google의 Web Vitals 권장 기준 사용
 */
function getRating(metric: Metric): 'good' | 'needs-improvement' | 'poor' {
  const { name, value } = metric;

  // 각 메트릭별 임계값 (단위: ms, CLS는 단위 없음)
  const thresholds: Record<string, [number, number]> = {
    LCP: [2500, 4000], // Good: <2.5s, Poor: >4s
    CLS: [0.1, 0.25], // Good: <0.1, Poor: >0.25 (단위 없음)
    FCP: [1800, 3000], // Good: <1.8s, Poor: >3s
    TTFB: [800, 1800], // Good: <800ms, Poor: >1800ms
    INP: [200, 500], // Good: <200ms, Poor: >500ms
  };

  const [goodThreshold, poorThreshold] = thresholds[name] || [0, 0];

  if (value <= goodThreshold) return 'good';
  if (value <= poorThreshold) return 'needs-improvement';
  return 'poor';
}
