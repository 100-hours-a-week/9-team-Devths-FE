import { QueryClient, HydrationBoundary, dehydrate } from '@tanstack/react-query';

import { prefetchLlmRooms } from '@/lib/api/serverLlmPrefetch';
import LlmRoomsPage from '@/screens/llm/LlmRoomsPage';

export default async function Page() {
  const queryClient = new QueryClient();
  await prefetchLlmRooms(queryClient);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <LlmRoomsPage />
    </HydrationBoundary>
  );
}
