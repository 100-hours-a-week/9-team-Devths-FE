import { Counter, Histogram, Registry, collectDefaultMetrics } from 'prom-client';

/**
 * Prometheus 메트릭 레지스트리
 * 서버 사이드에서만 사용됩니다.
 */
export const register = new Registry();

// Node.js 기본 메트릭 수집 (CPU, 메모리, 이벤트 루프 등)
// 서버 사이드 (Node.js runtime)에서만 실행됩니다.
if (typeof window === 'undefined') {
  collectDefaultMetrics({
    register,
  });
}

/**
 * HTTP 요청 처리 시간 (히스토그램)
 * API 라우트에서 요청-응답 시간 측정
 * 라벨: method, route, status
 */
export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5, 10], // 100ms, 500ms, 1s, 2s, 5s, 10s
  registers: [register],
});

/**
 * HTTP 요청 총 개수 (카운터)
 * API 라우트 호출 횟수 집계
 * 라벨: method, route, status
 */
export const httpRequestTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
  registers: [register],
});

/**
 * Web Vitals 시간 기반 메트릭 (히스토그램)
 * LCP, FCP, TTFB, INP — 단위: ms
 * 라벨: name, rating (good, needs-improvement, poor), page
 */
export const webVitalsMetric = new Histogram({
  name: 'web_vitals_ms',
  help: 'Web Vitals timing metrics in milliseconds (LCP, FCP, TTFB, INP)',
  labelNames: ['name', 'rating', 'page'],
  buckets: [100, 300, 500, 1000, 2500, 5000, 10000],
  registers: [register],
});

/**
 * CLS (Cumulative Layout Shift) 메트릭 (히스토그램)
 * CLS는 ms가 아닌 비율 값(0~1+)으로 별도 버킷 사용
 * 라벨: rating (good, needs-improvement, poor), page
 */
export const clsMetric = new Histogram({
  name: 'web_vitals_cls',
  help: 'Cumulative Layout Shift score (unitless ratio)',
  labelNames: ['rating', 'page'],
  buckets: [0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.5],
  registers: [register],
});
