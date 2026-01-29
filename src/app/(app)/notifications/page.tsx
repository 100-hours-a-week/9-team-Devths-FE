'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useHeader } from '@/components/layout/HeaderContext';
import NotificationsPage from '@/screens/notifications/NotificationsPage';

export default function Page() {
  const router = useRouter();
  const { setOptions, resetOptions } = useHeader();

  useEffect(() => {
    setOptions({
      title: '알림',
      showBackButton: true,
      onBackClick: () => router.back(),
    });

    return () => resetOptions();
  }, [resetOptions, router, setOptions]);

  return <NotificationsPage />;
}
