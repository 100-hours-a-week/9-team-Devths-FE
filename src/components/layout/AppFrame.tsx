import BottomNav from '@/components/layout/BottomNav';
import Header from '@/components/layout/Header';

import type { ReactNode } from 'react';

type AppFrameProps = {
  children: ReactNode;
};

export default function AppFrame({ children }: AppFrameProps) {
  return (
    <div className="min-h-dvh w-full bg-neutral-50">
      <div className="mx-auto min-h-dvh w-full bg-white sm:max-w-[430px]">
        <Header title="Devths" />
        <div className="px-4 pb-16 sm:px-6">{children}</div>
      </div>

      <BottomNav />
    </div>
  );
}
