'use client';

import LlmRoomListItem from '@/components/llm/rooms/LlmRoomListItem';

import type { LlmRoom } from '@/components/llm/rooms/types';

type Props = {
  rooms: LlmRoom[];
  activeAnalysisRoomId?: number | null;
  onEnterRoom: (roomId: string, numericId: number) => void;
  onDeleteRoom: (roomId: string) => void;
  onAnalyzingRoomClick?: (roomId: string, numericId: number) => void;
};

export default function LlmRoomList({
  rooms,
  activeAnalysisRoomId,
  onEnterRoom,
  onDeleteRoom,
  onAnalyzingRoomClick,
}: Props) {
  return (
    <div className="flex flex-col gap-4">
      {rooms.map((room) => (
        <LlmRoomListItem
          key={room.id}
          room={room}
          isAnalyzing={activeAnalysisRoomId === room.numericId}
          onEnter={() => onEnterRoom(room.id, room.numericId)}
          onAnalyzingClick={() => onAnalyzingRoomClick?.(room.id, room.numericId)}
          onDelete={onDeleteRoom}
        />
      ))}
    </div>
  );
}
