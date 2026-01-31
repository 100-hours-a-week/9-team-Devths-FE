export type LandingSlide = {
  id: string;
  title: string;
  description: string;
};

export const LANDING_SLIDES: LandingSlide[] = [
  {
    id: 'slide-1',
    title: '취업 준비, 한 번에',
    description: '모든 취업 준비를 한 곳에서 관리해보세요',
  },
  {
    id: 'slide-2',
    title: 'AI가 짚어주는 피드백',
    description: '이력서와 포트폴리오를 분석하고 구체적인 피드백을 제공합니다',
  },
  {
    id: 'slide-3',
    title: 'AI 모의 면접으로 실전처럼',
    description: 'AI와 함께 면접 연습으로 자신감을 키워보세요',
  },
  {
    id: 'slide-4',
    title: '일정까지 깔끔하게',
    description: '취업 준비의 모든 과정을 체계적으로 관리하세요',
  },
];
