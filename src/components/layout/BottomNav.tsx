'use client';

import clsx from 'clsx';
import { Bot, Home, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type Tab = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
};

const TABS: Tab[] = [
  { label: '홈', href: '/calendar', icon: Home },
  { label: 'AI', href: '/llm', icon: Bot },
  { label: '프로필', href: '/me', icon: User, disabled: true },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 z-50 w-full -translate-x-1/2 bg-white sm:max-w-[430px]">
      <div className="border-t">
        <div className="grid h-16 grid-cols-3 px-2">
          {TABS.map((tab) => {
            const isActive = pathname.startsWith(tab.href);
            const Icon = tab.icon;

            const baseClass = clsx(
              'flex flex-col items-center justify-center gap-1 rounded-md px-2 py-2 text-[11px]',
              tab.disabled ? 'opacity-40' : 'hover:bg-neutral-100',
            );

            const activeClass = clsx(
              isActive ? 'font-medium text-neutral-900' : 'text-neutral-500',
            );

            if (tab.disabled) {
              return (
                <div key={tab.label} className={clsx(baseClass, activeClass)} aria-disabled="true">
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </div>
              );
            }

            return (
              <Link key={tab.label} href={tab.href} className={clsx(baseClass, activeClass)}>
                <Icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
