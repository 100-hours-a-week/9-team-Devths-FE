import type { BoardInterest, BoardPostSummary, BoardSort, BoardTag } from '@/types/board';
import type { CursorPage } from '@/types/pagination';

type ListBoardPostsParams = {
  size: number;
  lastId?: number | null;
  sort: BoardSort;
  tags?: BoardTag[];
};

const now = Date.now();

const mockInterestsByUserId: Record<number, BoardInterest[]> = {
  11: ['프론트엔드', '인공지능'],
  18: ['백엔드', '클라우드'],
  21: ['백엔드'],
  27: ['프론트엔드', '클라우드'],
  33: ['프론트엔드'],
  34: ['백엔드', '인공지능'],
  44: ['백엔드'],
  45: ['프론트엔드'],
  52: ['클라우드'],
  55: ['프론트엔드', '백엔드'],
  61: ['인공지능'],
  68: ['백엔드'],
  73: ['백엔드', '인공지능'],
  77: ['프론트엔드', '클라우드'],
  82: ['백엔드'],
  88: ['인공지능'],
  91: ['백엔드', '클라우드'],
  92: ['프론트엔드'],
  95: ['백엔드', '인공지능'],
  97: ['프론트엔드', '백엔드'],
};

const mockPosts: BoardPostSummary[] = [
  {
    postId: 120,
    title: '카카오 프론트엔드 1차 코테 후기',
    preview: '오늘 카카오 1차 코딩테스트를 봤습니다. 3문제 중...',
    tags: ['코딩테스트'],
    createdAt: new Date(now - 1000 * 60 * 18).toISOString(),
    author: {
      userId: 11,
      nickname: '김개발',
      profileImageUrl: null,
      interests: mockInterestsByUserId[11],
    },
    stats: { likeCount: 124, commentCount: 23, shareCount: 8 },
  },
  {
    postId: 119,
    title: 'NHN 백엔드 최종 면접 질문 정리',
    preview: '최종 합격했습니다! 면접 질문 공유합니다. 1. 프로젝트에서...',
    tags: ['면접'],
    createdAt: new Date(now - 1000 * 60 * 60 * 5).toISOString(),
    author: {
      userId: 21,
      nickname: 'david',
      profileImageUrl: null,
      interests: mockInterestsByUserId[21],
    },
    stats: { likeCount: 256, commentCount: 45, shareCount: 32 },
  },
  {
    postId: 118,
    title: '신입 개발자 이력서 첨삭 받고 싶어요',
    preview: '이력서 첨삭받고 피드백 부탁드립니다. 프로젝트 3개...',
    tags: ['이력서', '포트폴리오'],
    createdAt: new Date(now - 1000 * 60 * 60 * 11).toISOString(),
    author: {
      userId: 34,
      nickname: '박개발',
      profileImageUrl: null,
      interests: mockInterestsByUserId[34],
    },
    stats: { likeCount: 89, commentCount: 15, shareCount: 12 },
  },
  {
    postId: 117,
    title: '포트폴리오 v2 피드백 부탁드립니다',
    preview: '포트폴리오를 개선했습니다. UI와 구성 위주로 봐주세요...',
    tags: ['포트폴리오'],
    createdAt: new Date(now - 1000 * 60 * 60 * 26).toISOString(),
    author: {
      userId: 45,
      nickname: '최초심',
      profileImageUrl: null,
      interests: mockInterestsByUserId[45],
    },
    stats: { likeCount: 312, commentCount: 18, shareCount: 12 },
  },
  {
    postId: 116,
    title: '배달앱 면접 전형 프로세스 공유',
    preview: '이번에 3개 기업 면접을 보면서 느낀 점을 공유합니다...',
    tags: ['면접'],
    createdAt: new Date(now - 1000 * 60 * 60 * 52).toISOString(),
    author: {
      userId: 52,
      nickname: '김한결',
      profileImageUrl: null,
      interests: mockInterestsByUserId[52],
    },
    stats: { likeCount: 178, commentCount: 34, shareCount: 21 },
  },
  {
    postId: 115,
    title: 'React 면접 질문 모음',
    preview: '최근 면접에서 자주 나온 질문을 정리했습니다...',
    tags: ['면접'],
    createdAt: new Date(now - 1000 * 60 * 60 * 90).toISOString(),
    author: {
      userId: 18,
      nickname: '초코칩',
      profileImageUrl: null,
      interests: mockInterestsByUserId[18],
    },
    stats: { likeCount: 541, commentCount: 60, shareCount: 44 },
  },
  {
    postId: 114,
    title: '포트폴리오 프로젝트 구조 설명',
    preview: '프로젝트 구조를 어떻게 잡았는지 공유합니다...',
    tags: ['포트폴리오'],
    createdAt: new Date(now - 1000 * 60 * 60 * 120).toISOString(),
    author: {
      userId: 27,
      nickname: '민트',
      profileImageUrl: null,
      interests: mockInterestsByUserId[27],
    },
    stats: { likeCount: 820, commentCount: 72, shareCount: 55 },
  },
  {
    postId: 113,
    title: '이력서 요약 문구 추천받아요',
    preview: '요약 문구를 어떻게 쓰는 게 좋을까요? 피드백 부탁...',
    tags: ['이력서'],
    createdAt: new Date(now - 1000 * 60 * 60 * 150).toISOString(),
    author: {
      userId: 61,
      nickname: '리나',
      profileImageUrl: null,
      interests: mockInterestsByUserId[61],
    },
    stats: { likeCount: 64, commentCount: 9, shareCount: 4 },
  },
  {
    postId: 112,
    title: '코딩테스트 2주 준비 플랜',
    preview: '2주 안에 준비하려면 이렇게 하세요. 하루 3문제...',
    tags: ['코딩테스트'],
    createdAt: new Date(now - 1000 * 60 * 60 * 200).toISOString(),
    author: {
      userId: 73,
      nickname: '알고맨',
      profileImageUrl: null,
      interests: mockInterestsByUserId[73],
    },
    stats: { likeCount: 1024, commentCount: 140, shareCount: 88 },
  },
  {
    postId: 111,
    title: '면접에서 실수했던 질문들',
    preview: '실수했던 질문들을 공유합니다. 같은 실수 안 하길...',
    tags: ['면접'],
    createdAt: new Date(now - 1000 * 60 * 60 * 260).toISOString(),
    author: {
      userId: 82,
      nickname: '루카스',
      profileImageUrl: null,
      interests: mockInterestsByUserId[82],
    },
    stats: { likeCount: 430, commentCount: 20, shareCount: 16 },
  },
  {
    postId: 110,
    title: '이력서 프로젝트 기술스택 작성 팁',
    preview: '기술스택은 이렇게 쓰면 좋아요. 실제로 효과가 있었던...',
    tags: ['이력서'],
    createdAt: new Date(now - 1000 * 60 * 60 * 310).toISOString(),
    author: {
      userId: 91,
      nickname: '브루노',
      profileImageUrl: null,
      interests: mockInterestsByUserId[91],
    },
    stats: { likeCount: 590, commentCount: 27, shareCount: 19 },
  },
  {
    postId: 109,
    title: '포트폴리오 피그마 링크 정리',
    preview: '피그마로 작업하신 분들 링크 정리해서 공유합니다...',
    tags: ['포트폴리오'],
    createdAt: new Date(now - 1000 * 60 * 60 * 360).toISOString(),
    author: {
      userId: 33,
      nickname: '소라',
      profileImageUrl: null,
      interests: mockInterestsByUserId[33],
    },
    stats: { likeCount: 210, commentCount: 17, shareCount: 11 },
  },
  {
    postId: 108,
    title: '코딩테스트 자주 나오는 패턴',
    preview: '투포인터, 슬라이딩 윈도우, BFS/DFS 정리합니다...',
    tags: ['코딩테스트'],
    createdAt: new Date(now - 1000 * 60 * 60 * 420).toISOString(),
    author: {
      userId: 44,
      nickname: '레오',
      profileImageUrl: null,
      interests: mockInterestsByUserId[44],
    },
    stats: { likeCount: 760, commentCount: 95, shareCount: 61 },
  },
  {
    postId: 107,
    title: '이력서 첨삭 후기',
    preview: '첨삭 받은 내용 공유합니다. 오탈자보다 중요한 건...',
    tags: ['이력서'],
    createdAt: new Date(now - 1000 * 60 * 60 * 470).toISOString(),
    author: {
      userId: 55,
      nickname: '단비',
      profileImageUrl: null,
      interests: mockInterestsByUserId[55],
    },
    stats: { likeCount: 330, commentCount: 12, shareCount: 7 },
  },
  {
    postId: 106,
    title: '면접 자기소개 스크립트',
    preview: '자기소개 스크립트 템플릿 공유합니다. 1분 버전...',
    tags: ['면접'],
    createdAt: new Date(now - 1000 * 60 * 60 * 520).toISOString(),
    author: {
      userId: 68,
      nickname: '하늘',
      profileImageUrl: null,
      interests: mockInterestsByUserId[68],
    },
    stats: { likeCount: 910, commentCount: 100, shareCount: 70 },
  },
  {
    postId: 105,
    title: '포트폴리오 레이아웃 개선 기록',
    preview: '레이아웃을 개선하면서 고려했던 포인트를 공유합니다...',
    tags: ['포트폴리오'],
    createdAt: new Date(now - 1000 * 60 * 60 * 580).toISOString(),
    author: {
      userId: 77,
      nickname: '지수',
      profileImageUrl: null,
      interests: mockInterestsByUserId[77],
    },
    stats: { likeCount: 420, commentCount: 25, shareCount: 14 },
  },
  {
    postId: 104,
    title: '코테 준비를 위한 추천 문제',
    preview: '백준/프로그래머스 기준 추천 문제를 모았습니다...',
    tags: ['코딩테스트'],
    createdAt: new Date(now - 1000 * 60 * 60 * 630).toISOString(),
    author: {
      userId: 88,
      nickname: '알파',
      profileImageUrl: null,
      interests: mockInterestsByUserId[88],
    },
    stats: { likeCount: 1500, commentCount: 220, shareCount: 180 },
  },
  {
    postId: 103,
    title: '이력서 프로젝트 설명 이렇게 했어요',
    preview: '프로젝트 설명을 구체화하는 데 도움이 되었던 포맷...',
    tags: ['이력서'],
    createdAt: new Date(now - 1000 * 60 * 60 * 700).toISOString(),
    author: {
      userId: 92,
      nickname: '가을',
      profileImageUrl: null,
      interests: mockInterestsByUserId[92],
    },
    stats: { likeCount: 205, commentCount: 19, shareCount: 10 },
  },
  {
    postId: 102,
    title: '면접 준비 체크리스트',
    preview: '면접 전날 체크리스트를 공유합니다. 복장, 질문...',
    tags: ['면접'],
    createdAt: new Date(now - 1000 * 60 * 60 * 780).toISOString(),
    author: {
      userId: 95,
      nickname: '솔',
      profileImageUrl: null,
      interests: mockInterestsByUserId[95],
    },
    stats: { likeCount: 610, commentCount: 35, shareCount: 22 },
  },
  {
    postId: 101,
    title: '포트폴리오 프로젝트 회고',
    preview: '프로젝트 회고를 공유합니다. 기술 선택 이유와...',
    tags: ['포트폴리오'],
    createdAt: new Date(now - 1000 * 60 * 60 * 840).toISOString(),
    author: {
      userId: 97,
      nickname: '채원',
      profileImageUrl: null,
      interests: mockInterestsByUserId[97],
    },
    stats: { likeCount: 480, commentCount: 20, shareCount: 13 },
  },
];

const FOLLOWING_USER_IDS = new Set([11, 21, 45, 77]);

function matchesTags(post: BoardPostSummary, tags?: BoardTag[]) {
  if (!tags || tags.length === 0) return true;
  return tags.some((tag) => post.tags.includes(tag));
}

function sortPosts(posts: BoardPostSummary[], sort: BoardSort) {
  if (sort === 'POPULAR') {
    return [...posts].sort((a, b) => {
      if (b.stats.likeCount !== a.stats.likeCount) {
        return b.stats.likeCount - a.stats.likeCount;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  return [...posts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export async function listBoardPosts(params: ListBoardPostsParams): Promise<CursorPage<BoardPostSummary>> {
  const { size, lastId, sort, tags } = params;

  let filtered = mockPosts.filter((post) => matchesTags(post, tags));

  if (sort === 'POPULAR') {
    filtered = filtered.filter((post) => post.stats.likeCount >= 500);
  }

  if (sort === 'FOLLOWING') {
    filtered = filtered.filter((post) => FOLLOWING_USER_IDS.has(post.author.userId));
  }

  const sorted = sortPosts(filtered, sort);
  const cursorFiltered = lastId ? sorted.filter((post) => post.postId < lastId) : sorted;
  const items = cursorFiltered.slice(0, size);
  const lastItem = items.at(-1) ?? null;
  const hasNext = cursorFiltered.length > items.length;

  return Promise.resolve({
    items,
    lastId: lastItem ? lastItem.postId : null,
    hasNext,
  });
}
