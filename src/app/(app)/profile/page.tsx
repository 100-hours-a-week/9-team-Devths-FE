import { QueryClient, HydrationBoundary, dehydrate } from '@tanstack/react-query';

import { prefetchProfile } from '@/lib/api/serverProfilePrefetch';
import MyPageScreen from '@/components/mypage/MyPageScreen';

export default async function ProfilePage() {
  const queryClient = new QueryClient();
  await prefetchProfile(queryClient);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MyPageScreen />
    </HydrationBoundary>
  );
}
