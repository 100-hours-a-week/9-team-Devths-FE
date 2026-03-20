'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';

import { useHeader } from '@/components/layout/HeaderContext';
import { useAccessibilityMode } from '@/lib/hooks/accessibility/useAccessibilityMode';
import { usePushNotificationToggle } from '@/lib/hooks/notifications/useFcmToken';

function ToggleSwitch({
  checked,
  disabled = false,
  onClick,
}: Readonly<{
  checked: boolean;
  disabled?: boolean;
  onClick: () => void;
}>) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onClick}
      disabled={disabled}
      className={`relative h-6 w-11 rounded-full transition-colors disabled:opacity-50 ${
        checked ? 'bg-[#05C075]' : 'bg-neutral-300'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

export default function ProfileSettingsScreen() {
  const router = useRouter();
  const { setOptions, resetOptions } = useHeader();
  const { isOn: isAccessibilityOn, toggle: toggleAccessibility } = useAccessibilityMode();
  const {
    isActive: isPushActive,
    isPending: isPushPending,
    toggle: togglePush,
    isSupported: isPushSupported,
  } = usePushNotificationToggle();

  const handleBackClick = useCallback(() => {
    router.push('/profile');
  }, [router]);

  useEffect(() => {
    setOptions({
      title: '설정',
      showBackButton: true,
      onBackClick: handleBackClick,
    });

    return () => resetOptions();
  }, [handleBackClick, resetOptions, setOptions]);

  return (
    <main className="px-4 pt-4 pb-6">
      <section className="rounded-2xl border border-neutral-200 bg-white">
        {isPushSupported ? (
          <div className="flex items-center justify-between gap-4 px-4 py-4">
            <div>
              <p className="text-sm font-semibold text-neutral-900">푸시 알림</p>
              <p className="mt-1 text-xs text-neutral-500">새 알림을 푸시로 받습니다</p>
            </div>
            <ToggleSwitch
              checked={isPushActive}
              disabled={isPushPending}
              onClick={() => {
                void togglePush();
              }}
            />
          </div>
        ) : (
          <div className="px-4 py-4">
            <p className="text-sm font-semibold text-neutral-900">푸시 알림</p>
            <p className="mt-1 text-xs text-neutral-500">
              현재 기기에서는 푸시 알림 설정을 지원하지 않습니다.
            </p>
          </div>
        )}

        <div className="border-t border-neutral-200" />

        <div className="flex items-center justify-between gap-4 px-4 py-4">
          <div>
            <p className="text-sm font-semibold text-neutral-900">접근성 모드</p>
            <p className="mt-1 text-xs text-neutral-500">가독성을 높이는 스타일을 적용합니다</p>
          </div>
          <ToggleSwitch checked={isAccessibilityOn} onClick={toggleAccessibility} />
        </div>
      </section>
    </main>
  );
}
