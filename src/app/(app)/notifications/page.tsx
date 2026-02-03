'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';

import { useHeader } from '@/components/layout/HeaderContext';
import NotificationsPage from '@/screens/notifications/NotificationsPage';

export default function Page() {
  const router = useRouter();
  const { setOptions, resetOptions } = useHeader();

  const handleBackClick = useCallback(() => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }
    router.push('/llm');
  }, [router]);

  useEffect(() => {
    setOptions({
      title: '알림',
      showBackButton: true,
      onBackClick: handleBackClick,
    });

    return () => resetOptions();
  }, [handleBackClick, resetOptions, setOptions]);

  return <NotificationsPage />;
}
