import type { LlmRoom } from '@/components/llm/rooms/types';

export const mockRooms: LlmRoom[] = [
  { id: 'demo-room-1', numericId: 1, title: '채팅방 이름 1', updatedAt: '오후 2:00', storage: 'TEMP' },
  { id: 'demo-room-2', numericId: 2, title: '채팅방 이름 2', updatedAt: '오후 1:10', storage: 'TEMP' },
  { id: 'demo-room-3', numericId: 3, title: '채팅방 이름 3', updatedAt: '어제', storage: 'ARCHIVED' },
  { id: 'demo-room-4', numericId: 4, title: '채팅방 이름 4', updatedAt: '어제', storage: 'ARCHIVED' },
  { id: 'demo-room-5', numericId: 5, title: '채팅방 이름 5', updatedAt: '1/24', storage: 'TEMP' },
];
