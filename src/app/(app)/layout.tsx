import AppFrame from '@/components/layout/AppFrame';

import type { ReactNode } from 'react';

type AppLayoutProps = {
  children: ReactNode;
};

export default function AppLayout({ children }: AppLayoutProps) {
  return <AppFrame>{children}</AppFrame>;
}
