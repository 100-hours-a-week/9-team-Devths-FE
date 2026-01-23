import type { InterestOption } from '@/components/common/InterestChips';

export const INTEREST_OPTIONS = [
  { value: 'BACKEND', label: 'BE' },
  { value: 'FRONTEND', label: 'FE' },
  { value: 'CLOUD', label: 'CLOUD' },
  { value: 'AI', label: 'AI' },
] as const satisfies readonly InterestOption[];

export type InterestValue = (typeof INTEREST_OPTIONS)[number]['value'];
