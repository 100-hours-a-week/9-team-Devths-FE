import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  pushMock,
  backMock,
  setOptionsMock,
  resetOptionsMock,
  useBoardSearchQueryMock,
} = vi.hoisted(() => ({
  pushMock: vi.fn(),
  backMock: vi.fn(),
  setOptionsMock: vi.fn(),
  resetOptionsMock: vi.fn(),
  useBoardSearchQueryMock: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
    back: backMock,
  }),
}));

vi.mock('@/components/layout/HeaderContext', () => ({
  useHeader: () => ({
    setOptions: setOptionsMock,
    resetOptions: resetOptionsMock,
  }),
}));

vi.mock('@/lib/hooks/boards/useBoardSearchQuery', () => ({
  useBoardSearchQuery: (params: unknown) => useBoardSearchQueryMock(params),
}));

vi.mock('@/components/board/BoardPostCard', () => ({
  default: ({
    post,
    onClick,
  }: {
    post: { postId: number; title: string };
    onClick?: (postId: number) => void;
  }) => (
    <button type="button" onClick={() => onClick?.(post.postId)}>
      card-{post.title}
    </button>
  ),
}));

import BoardSearchPage from '@/screens/board/BoardSearchPage';

const RECENT_SEARCH_STORAGE_KEY = 'devths_board_recent_searches';

type MockSearchParams = {
  keyword: string;
  size?: number;
  lastId?: number | null;
};

type MockSearchResult = {
  data: {
    items: Array<{ postId: number; title: string }>;
    lastId: number | null;
    hasNext: boolean;
  };
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: ReturnType<typeof vi.fn>;
};

function createQueryResult(overrides?: Partial<MockSearchResult>): MockSearchResult {
  return {
    data: {
      items: [],
      lastId: null,
      hasNext: false,
    },
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    ...overrides,
  };
}

function createLocalStorageMock() {
  const store = new Map<string, string>();

  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
  };
}

describe('BoardSearchPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    Object.defineProperty(window, 'localStorage', {
      value: createLocalStorageMock(),
      configurable: true,
    });
    window.localStorage.clear();

    useBoardSearchQueryMock.mockImplementation(() => createQueryResult());
  });

  it('입력 검증 헬퍼 텍스트를 노출한다', async () => {
    const user = userEvent.setup();
    render(<BoardSearchPage />);

    await user.click(screen.getByRole('button', { name: '게시글 검색' }));
    expect(screen.getByText('검색어를 입력해 주세요.')).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText('Search'), 'a');
    await user.click(screen.getByRole('button', { name: '게시글 검색' }));
    expect(screen.getByText('검색어는 2자 이상 입력해 주세요.')).toBeInTheDocument();

    await user.clear(screen.getByPlaceholderText('Search'));
    await user.type(screen.getByPlaceholderText('Search'), 'a'.repeat(31));
    await user.click(screen.getByRole('button', { name: '게시글 검색' }));
    expect(screen.getByText('검색어는 최대 30자까지 입력할 수 있습니다.')).toBeInTheDocument();
  });

  it('최근 검색어 클릭 재검색과 X 삭제가 동작한다', async () => {
    const user = userEvent.setup();
    window.localStorage.setItem(RECENT_SEARCH_STORAGE_KEY, JSON.stringify(['react', 'spring']));

    render(<BoardSearchPage />);

    await user.click(screen.getByRole('button', { name: 'react' }));
    expect(screen.getByPlaceholderText('Search')).toHaveValue('react');

    await user.click(screen.getByRole('button', { name: 'spring 최근 검색어 삭제' }));
    expect(screen.queryByRole('button', { name: 'spring' })).not.toBeInTheDocument();

    const stored = JSON.parse(window.localStorage.getItem(RECENT_SEARCH_STORAGE_KEY) ?? '[]') as string[];
    expect(stored).toEqual(['react']);
  });

  it('검색 결과 카드를 렌더링하고 클릭 시 상세로 이동한다', async () => {
    const user = userEvent.setup();

    useBoardSearchQueryMock.mockImplementation((params: MockSearchParams) => {
      if (params.keyword === 'react') {
        return createQueryResult({
          data: {
            items: [
              { postId: 101, title: 'React 제목' },
              { postId: 102, title: 'React 두번째' },
            ],
            lastId: null,
            hasNext: false,
          },
        });
      }
      return createQueryResult();
    });

    render(<BoardSearchPage />);

    await user.type(screen.getByPlaceholderText('Search'), 'react');
    await user.click(screen.getByRole('button', { name: '게시글 검색' }));

    expect(await screen.findByRole('button', { name: 'card-React 제목' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'card-React 두번째' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'card-React 제목' }));
    expect(pushMock).toHaveBeenCalledWith('/board/101');
  });

  it('페이지네이션 이전/다음/번호(최대 5개) 상태가 동작한다', async () => {
    const user = userEvent.setup();

    useBoardSearchQueryMock.mockImplementation((params: MockSearchParams) => {
      if (params.keyword !== 'page') {
        return createQueryResult();
      }

      const pageByLastId: Record<string, { page: number; nextLastId: number | null; hasNext: boolean }> = {
        null: { page: 1, nextLastId: 11, hasNext: true },
        '11': { page: 2, nextLastId: 22, hasNext: true },
        '22': { page: 3, nextLastId: 33, hasNext: true },
        '33': { page: 4, nextLastId: 44, hasNext: true },
        '44': { page: 5, nextLastId: 55, hasNext: true },
        '55': { page: 6, nextLastId: 66, hasNext: true },
        '66': { page: 7, nextLastId: null, hasNext: false },
      };

      const key = String(params.lastId ?? null);
      const pageData = pageByLastId[key] ?? pageByLastId.null;

      return createQueryResult({
        data: {
          items: [{ postId: pageData.page, title: `page-${pageData.page}` }],
          lastId: pageData.nextLastId,
          hasNext: pageData.hasNext,
        },
      });
    });

    render(<BoardSearchPage />);

    await user.type(screen.getByPlaceholderText('Search'), 'page');
    await user.click(screen.getByRole('button', { name: '게시글 검색' }));

    expect(await screen.findByRole('button', { name: 'card-page-1' })).toBeInTheDocument();

    const prevButton = screen.getByRole('button', { name: '이전' });
    expect(prevButton).toBeDisabled();

    await user.click(screen.getByRole('button', { name: '다음' }));
    expect(await screen.findByRole('button', { name: 'card-page-2' })).toBeInTheDocument();
    expect(prevButton).not.toBeDisabled();

    await user.click(screen.getByRole('button', { name: '다음' }));
    await screen.findByRole('button', { name: 'card-page-3' });
    await user.click(screen.getByRole('button', { name: '다음' }));
    await screen.findByRole('button', { name: 'card-page-4' });
    await user.click(screen.getByRole('button', { name: '다음' }));
    await screen.findByRole('button', { name: 'card-page-5' });
    await user.click(screen.getByRole('button', { name: '다음' }));
    await screen.findByRole('button', { name: 'card-page-6' });

    const pageNumberButtons = screen
      .getAllByRole('button')
      .filter((button) => /^\d+$/.test(button.textContent ?? ''));

    expect(pageNumberButtons.length).toBeLessThanOrEqual(5);
    expect(screen.getByRole('button', { name: '6' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '이전' }));
    expect(await screen.findByRole('button', { name: 'card-page-5' })).toBeInTheDocument();
  });
});
