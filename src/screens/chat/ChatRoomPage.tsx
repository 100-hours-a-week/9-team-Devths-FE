'use client';

import { Menu } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo } from 'react';

import { useHeader } from '@/components/layout/HeaderContext';
import { useChatRoomDetailQuery } from '@/lib/hooks/chat/useChatRoomDetailQuery';
import { toast } from '@/lib/toast/store';

type ChatRoomPageProps = Readonly<{
  roomId: number | null;
}>;

function resolveTitle(roomName: string | null, title: string | null) {
  const trimmedRoomName = roomName?.trim();
  if (trimmedRoomName) {
    return trimmedRoomName;
  }

  const trimmedTitle = title?.trim();
  if (trimmedTitle) {
    return trimmedTitle;
  }

  return '채팅방';
}

export default function ChatRoomPage({ roomId }: ChatRoomPageProps) {
  const router = useRouter();
  const { setOptions, resetOptions } = useHeader();
  const { data, isLoading, isError, refetch } = useChatRoomDetailQuery(roomId);

  const headerTitle = useMemo(
    () => resolveTitle(data?.roomName ?? null, data?.title ?? null),
    [data?.roomName, data?.title],
  );

  const handleBackClick = useCallback(() => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }
    router.push('/chat');
  }, [router]);

  const handleSettingsClick = useCallback(() => {
    toast('채팅방 설정 화면 준비 중입니다.');
  }, []);

  const rightSlot = useMemo(
    () => (
      <button
        type="button"
        onClick={handleSettingsClick}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-neutral-100"
        aria-label="채팅방 설정"
      >
        <Menu className="h-5 w-5" />
      </button>
    ),
    [handleSettingsClick],
  );

  useEffect(() => {
    setOptions({
      title: headerTitle,
      showBackButton: true,
      onBackClick: handleBackClick,
      rightSlot,
    });

    return () => resetOptions();
  }, [handleBackClick, headerTitle, resetOptions, rightSlot, setOptions]);

  if (roomId === null) {
    return (
      <main className="px-3 pt-4 pb-3">
        <div className="flex h-[50vh] flex-col items-center justify-center gap-3 rounded-2xl border border-neutral-200 bg-white">
          <p className="text-sm font-semibold text-neutral-900">유효하지 않은 채팅방입니다.</p>
          <button
            type="button"
            onClick={() => router.push('/chat')}
            className="rounded-lg bg-neutral-900 px-3 py-2 text-xs font-semibold text-white"
          >
            채팅 목록으로 이동
          </button>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="px-3 pt-4 pb-3">
        <div className="space-y-2 rounded-2xl border border-neutral-200 bg-white p-4">
          <div className="h-4 w-24 animate-pulse rounded bg-neutral-200" />
          <div className="h-4 w-40 animate-pulse rounded bg-neutral-200" />
          <div className="h-20 animate-pulse rounded-xl bg-neutral-100" />
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="px-3 pt-4 pb-3">
        <div className="flex h-[50vh] flex-col items-center justify-center gap-3 rounded-2xl border border-neutral-200 bg-white">
          <p className="text-sm font-semibold text-neutral-900">
            채팅방 정보를 불러올 수 없습니다.
          </p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="rounded-lg bg-neutral-900 px-3 py-2 text-xs font-semibold text-white"
          >
            다시 시도
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="px-3 pt-4 pb-3">
      <section className="rounded-2xl border border-neutral-200 bg-white p-4">
        <p className="text-sm font-semibold text-neutral-900">{headerTitle}</p>
        <p className="mt-2 text-xs text-neutral-500">
          채팅방 상세 화면 뼈대가 준비되었습니다. 다음 커밋에서 메시지 목록/입력 UI를 연결합니다.
        </p>
      </section>
    </main>
  );
}
