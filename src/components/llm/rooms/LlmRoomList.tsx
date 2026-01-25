'use client';

import LlmRoomCard, { type StorageStatus } from '@/components/llm/rooms/LlmRoomCard';

export type LlmRoomData = {
  id: string;
  title: string;
  status: StorageStatus;
};

type Props = {
  rooms: LlmRoomData[];
  onToggleStatus?: (id: string, next: StorageStatus) => void;
  onDelete?: (id: string) => void;
};

export default function LlmRoomList({ rooms, onToggleStatus, onDelete }: Props) {
  return (
    <section className="mt-4 flex flex-col gap-4">
      {rooms.map((room) => (
        <LlmRoomCard
          key={room.id}
          id={room.id}
          title={room.title}
          status={room.status}
          onToggleStatus={(next) => onToggleStatus?.(room.id, next)}
          onDelete={() => onDelete?.(room.id)}
        />
      ))}
    </section>
  );
}
