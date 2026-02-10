import AppFrame from '@/components/layout/AppFrame';

import { Suspense } from 'react';
import type { ReactNode } from 'react';

type AppLayoutProps = {
  children: ReactNode;
};

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <Suspense>
      <AppFrame>{children}</AppFrame>
    </Suspense>
  );
}
