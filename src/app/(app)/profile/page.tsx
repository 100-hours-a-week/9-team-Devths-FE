import { QueryClient, HydrationBoundary, dehydrate } from '@tanstack/react-query';

import MyPageScreen from '@/components/mypage/MyPageScreen';
import { prefetchProfile } from '@/lib/api/serverProfilePrefetch';

export default async function ProfilePage() {
  const queryClient = new QueryClient();
  await prefetchProfile(queryClient);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MyPageScreen />
    </HydrationBoundary>
  );
}
