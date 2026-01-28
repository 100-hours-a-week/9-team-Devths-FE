export type RoomStorage = 'TEMP' | 'ARCHIVED';

export type LlmRoom = {
  id: string;
  numericId: number;
  title: string;
  updatedAt: string;
  storage: RoomStorage;
};
