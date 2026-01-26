'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import ConfirmModal from '@/components/common/ConfirmModal';
import ListLoadMoreSentinel from '@/components/llm/rooms/ListLoadMoreSentinel';
import LlmRoomCreateCard from '@/components/llm/rooms/LlmRoomCreateCard';
import LlmRoomEmptyState from '@/components/llm/rooms/LlmRoomEmptyState';
import LlmRoomList from '@/components/llm/rooms/LlmRoomList';
import { useArchiveRoomMutation } from '@/lib/hooks/llm/useArchiveRoomMutation';
import { useDeleteRoomMutation } from '@/lib/hooks/llm/useDeleteRoomMutation';
import { useRoomsInfiniteQuery } from '@/lib/hooks/llm/useRoomsInfiniteQuery';
import { toast } from '@/lib/toast/store';
import { mapAiChatRoomToLlmRoom } from '@/lib/utils/llm';

export default function LlmRoomsPage() {
  const router = useRouter();
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useRoomsInfiniteQuery();

  const archiveMutation = useArchiveRoomMutation();
  const deleteMutation = useDeleteRoomMutation();

  const [deleteTarget, setDeleteTarget] = useState<{ uuid: string; id: number } | null>(null);

  const handleArchiveRoom = (roomId: string) => {
    archiveMutation.mutate(roomId, {
      onError: () => {
        toast('대화 보관에 실패했습니다. 다시 시도해주세요.');
      },
    });
  };

  const handleDeleteRoom = (roomUuid: string) => {
    const targetRoom = data?.pages
      .flatMap((page) => (page ? page.rooms : []))
      .find((room) => room.roomUuid === roomUuid);

    if (!targetRoom) return;

    setDeleteTarget({ uuid: roomUuid, id: targetRoom.roomId });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;

    deleteMutation.mutate(deleteTarget.id, {
      onError: () => {
        toast('대화 삭제에 실패했습니다. 다시 시도해주세요.');
      },
      onSuccess: () => {
        setDeleteTarget(null);
      },
    });
  };

  if (isLoading) {
    return (
      <main className="px-3 pt-4 pb-3">
        <div className="flex h-[60vh] items-center justify-center">
          <p className="text-sm text-neutral-500">로딩 중...</p>
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="px-3 pt-4 pb-3">
        <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
          <p className="text-sm font-semibold text-neutral-900">데이터를 불러올 수 없습니다</p>
          <p className="text-xs text-neutral-500">네트워크 연결을 확인해주세요</p>
        </div>
      </main>
    );
  }

  const rooms =
    data?.pages.flatMap((page) => (page ? page.rooms.map(mapAiChatRoomToLlmRoom) : [])) ?? [];
  const hasRooms = rooms.length > 0;

  if (!hasRooms) {
    return <LlmRoomEmptyState href="/llm/analysis" />;
  }

  return (
    <>
      <main className="px-3 pt-4 pb-3">
        <LlmRoomCreateCard href="/llm/analysis" />

        <div className="mt-4">
          <div className="mb-3 flex items-center justify-between px-1">
            <p className="text-sm font-semibold text-neutral-900">대화 목록</p>
            <span className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-[11px] font-semibold text-neutral-600">
              최신순
            </span>
          </div>
          <LlmRoomList
            rooms={rooms}
            onEnterRoom={(id) => router.push(`/llm/${encodeURIComponent(id)}`)}
            onArchiveRoom={handleArchiveRoom}
            onDeleteRoom={handleDeleteRoom}
          />

          <ListLoadMoreSentinel
            onLoadMore={() => void fetchNextPage()}
            hasNextPage={hasNextPage ?? false}
            isFetchingNextPage={isFetchingNextPage}
          />
        </div>
      </main>

      <ConfirmModal
        isOpen={deleteTarget !== null}
        title="대화를 삭제하시겠어요?"
        message="삭제된 대화는 복구할 수 없습니다."
        confirmText="삭제"
        cancelText="취소"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
