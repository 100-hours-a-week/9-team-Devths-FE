'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';

import { useHeader } from '@/components/layout/HeaderContext';
import FollowListScreen from '@/components/mypage/FollowListScreen';

export default function FollowListPage() {
  const router = useRouter();
  const { setOptions, resetOptions } = useHeader();

  const handleBackClick = useCallback(() => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }
    router.push('/profile');
  }, [router]);

  useEffect(() => {
    setOptions({
      title: '팔로워/팔로잉',
      showBackButton: true,
      onBackClick: handleBackClick,
    });

    return () => resetOptions();
  }, [handleBackClick, resetOptions, setOptions]);

  return <FollowListScreen />;
}
