import { QueryClient, HydrationBoundary, dehydrate } from '@tanstack/react-query';

import { prefetchBoardDetail } from '@/lib/api/serverBoardPrefetch';
import BoardDetailPage from '@/screens/board/detail/BoardDetailPage';

type Props = {
  params: Promise<{ postId: string }>;
};

export default async function Page({ params }: Props) {
  const { postId: postIdStr } = await params;
  const postId = Number(postIdStr);

  const queryClient = new QueryClient();
  if (Number.isInteger(postId) && postId > 0) {
    await prefetchBoardDetail(queryClient, postId);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <BoardDetailPage />
    </HydrationBoundary>
  );
}
