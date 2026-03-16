import { QueryClient, HydrationBoundary, dehydrate } from '@tanstack/react-query';

import { prefetchChatRooms } from '@/lib/api/serverChatPrefetch';
import ChatPlaceholderPage from '@/screens/chat/ChatPlaceholderPage';

export default async function Page() {
  const queryClient = new QueryClient();
  await prefetchChatRooms(queryClient);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ChatPlaceholderPage />
    </HydrationBoundary>
  );
}
