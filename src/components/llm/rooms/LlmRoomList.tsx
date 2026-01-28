'use client';

import LlmRoomListItem from '@/components/llm/rooms/LlmRoomListItem';

import type { LlmRoom } from '@/components/llm/rooms/types';

type Props = {
  rooms: LlmRoom[];
  onEnterRoom: (roomId: string, numericId: number) => void;
  onDeleteRoom: (roomId: string) => void;
};

export default function LlmRoomList({ rooms, onEnterRoom, onDeleteRoom }: Props) {
  return (
    <div className="flex flex-col gap-4">
      {rooms.map((room) => (
        <LlmRoomListItem
          key={room.id}
          room={room}
          onEnter={() => onEnterRoom(room.id, room.numericId)}
          onDelete={onDeleteRoom}
        />
      ))}
    </div>
  );
}
