export type RoomStorage = 'TEMP' | 'ARCHIVED';

export type LlmRoom = {
  id: string;
  title: string;
  updatedAt: string;
  storage: RoomStorage;
};
