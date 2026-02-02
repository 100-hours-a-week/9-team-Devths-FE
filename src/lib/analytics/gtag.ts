export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? '';

type GtagEventParams = Record<string, unknown>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function trackEvent(action: string, params: GtagEventParams = {}) {
  if (typeof window === 'undefined') return;
  if (!window.gtag) return;
  window.gtag('event', action, params);
}

export function trackButtonClick(label: string, params: GtagEventParams = {}) {
  trackEvent('button_click', { button_name: label, ...params });
}
