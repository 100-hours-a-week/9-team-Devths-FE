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
 * Web Vitals 메트릭 (히스토그램)
 * 클라이언트에서 측정된 성능 지표
 * 라벨: name (LCP, CLS, FCP, TTFB, INP), rating (good, needs-improvement, poor), page
 */
export const webVitalsMetric = new Histogram({
  name: 'web_vitals',
  help: 'Web Vitals performance metrics',
  labelNames: ['name', 'rating', 'page'],
  buckets: [100, 300, 500, 1000, 2500, 5000, 10000], // ms
  registers: [register],
});

/**
 * 에러 발생 횟수 (카운터)
 * 클라이언트/서버 에러 추적
 * 라벨: type (client, server, api), severity (error, warning), page
 */
export const errorCount = new Counter({
  name: 'errors_total',
  help: 'Total number of errors',
  labelNames: ['type', 'severity', 'page'],
  registers: [register],
});
