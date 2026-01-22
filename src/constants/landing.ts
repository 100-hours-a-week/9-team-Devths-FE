export type LandingSlide = {
  id: string;
  title: string;
  description: string;
};

export const LANDING_SLIDES: LandingSlide[] = [
  {
    id: 'slide-1',
    title: 'Devths로 일정과 커뮤니케이션을 한 곳에서',
    description: '캘린더, 게시판, 채팅, AI 기능을 한 번에 관리해요.',
  },
  {
    id: 'slide-2',
    title: '팀 협업이 쉬워져요',
    description: '업무 흐름을 공유하고 중요한 내용을 놓치지 않아요.',
  },
  {
    id: 'slide-3',
    title: '오늘 할 일을 한눈에',
    description: '중요한 일정과 작업을 보기 좋게 정리해요.',
  },
  {
    id: 'slide-4',
    title: '대화로 시작하는 AI 도움',
    description: '필요한 순간에 바로 질문하고 도움을 받아요.',
  },
  {
    id: 'slide-5',
    title: '가볍게 시작해요',
    description: 'Google 로그인으로 빠르게 시작할 수 있어요.',
  },
];
