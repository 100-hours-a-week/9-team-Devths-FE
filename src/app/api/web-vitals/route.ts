import { NextRequest, NextResponse } from 'next/server';

import { clsMetric, webVitalsMetric } from '@/lib/metrics';

/**
 * Web Vitals 메트릭 수집 엔드포인트
 * POST /api/web-vitals
 *
 * 클라이언트에서 측정된 Web Vitals 메트릭을 Prometheus로 전송합니다.
 *
 * @example
 * fetch('/api/web-vitals', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     name: 'LCP',
 *     value: 1234.5,
 *     rating: 'good',
 *     page: '/dashboard'
 *   })
 * });
 */
export async function POST(request: NextRequest) {
  try {
    const metric = await request.json();

    // 메트릭 검증
    if (!metric.name || typeof metric.value !== 'number') {
      return NextResponse.json(
        { error: 'Invalid metric data. Required: name (string), value (number)' },
        { status: 400 },
      );
    }

    // CLS는 비율 값이므로 별도 메트릭에 기록
    if (metric.name === 'CLS') {
      clsMetric.observe(
        {
          rating: metric.rating || 'unknown',
          page: metric.page || 'unknown',
        },
        metric.value,
      );
    } else {
      webVitalsMetric.observe(
        {
          name: metric.name,
          rating: metric.rating || 'unknown',
          page: metric.page || 'unknown',
        },
        metric.value,
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to record web vitals metric:', error);
    return NextResponse.json({ error: 'Failed to record metric' }, { status: 500 });
  }
}

// POST만 허용
export const dynamic = 'force-dynamic';

// Node.js 런타임 사용 (prom-client는 Node.js API를 사용하므로 Edge Runtime 불가)
export const runtime = 'nodejs';
