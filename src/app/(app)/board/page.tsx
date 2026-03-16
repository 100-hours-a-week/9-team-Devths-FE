import { QueryClient, HydrationBoundary, dehydrate } from '@tanstack/react-query';

import { prefetchBoardPosts } from '@/lib/api/serverBoardPrefetch';
import BoardListPage from '@/screens/board/BoardListPage';

export default async function Page() {
  const queryClient = new QueryClient();
  await prefetchBoardPosts(queryClient);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <BoardListPage />
    </HydrationBoundary>
  );
}
