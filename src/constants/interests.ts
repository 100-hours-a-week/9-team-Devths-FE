import type { InterestOption } from '@/components/common/InterestChips';

export const INTEREST_OPTIONS = [
  { value: 'BACKEND', label: 'BE' },
  { value: 'FRONTEND', label: 'FE' },
  { value: 'CLOUD', label: 'CLOUD' },
  { value: 'AI', label: 'AI' },
] as const satisfies readonly InterestOption[];

export type InterestValue = (typeof INTEREST_OPTIONS)[number]['value'];

// 서버에서 한글로 올 수 있는 값 → 영문 대문자로 매핑
const INTEREST_KOREAN_TO_VALUE: Record<string, InterestValue> = {
  백엔드: 'BACKEND',
  프론트엔드: 'FRONTEND',
  클라우드: 'CLOUD',
  인공지능: 'AI',
};

/** 서버에서 받은 interests를 영문 대문자 형식으로 정규화 */
export function normalizeInterests(interests: string[]): InterestValue[] {
  return interests
    .map((i) => INTEREST_KOREAN_TO_VALUE[i] ?? (i as InterestValue))
    .filter((v, idx, arr) => arr.indexOf(v) === idx); // 중복 제거
}
