import type { ReactNode } from 'react';

type AppFrameProps = {
  children: ReactNode;
};

export default function AppFrame({ children }: AppFrameProps) {
  return (
    <div className="min-h-dvh w-full bg-neutral-50">
      <div className="mx-auto min-h-dvh w-full bg-white px-4 sm:max-w-[430px] sm:px-6">
        {children}
      </div>
    </div>
  );
}
