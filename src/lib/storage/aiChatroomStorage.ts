import type { RoomStorage } from '@/components/llm/rooms/types';

const STORAGE_KEY = 'ai_chatroom_storage_mode';
const EXPIRY_DAYS = 7;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

type StorageEntry = {
  mode: RoomStorage;
  savedAt: string;
};

type StorageMap = Record<string, StorageEntry>;

function getStorageMap(): StorageMap {
  if (typeof window === 'undefined') return {};

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};

    const data = JSON.parse(raw) as StorageMap;

    const now = Date.now();
    const cleaned: StorageMap = {};

    for (const [roomId, entry] of Object.entries(data)) {
      const savedAt = new Date(entry.savedAt).getTime();
      const ageInDays = (now - savedAt) / MS_PER_DAY;

      if (ageInDays < EXPIRY_DAYS) {
        cleaned[roomId] = entry;
      }
    }

    if (Object.keys(cleaned).length !== Object.keys(data).length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
    }

    return cleaned;
  } catch {
    return {};
  }
}

function setStorageMap(map: StorageMap): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {}
}

export function getRoomStorageMode(roomId: string): RoomStorage {
  const map = getStorageMap();
  return map[roomId]?.mode ?? 'TEMP';
}

export function archiveRoom(roomId: string): boolean {
  const map = getStorageMap();
  const current = map[roomId]?.mode ?? 'TEMP';

  if (current === 'ARCHIVED') {
    return false;
  }

  map[roomId] = {
    mode: 'ARCHIVED',
    savedAt: new Date().toISOString(),
  };

  setStorageMap(map);
  return true;
}

export function removeRoomStorage(roomId: string): void {
  const map = getStorageMap();
  delete map[roomId];
  setStorageMap(map);
}

export function isArchivedRoom(roomId: string): boolean {
  return getRoomStorageMode(roomId) === 'ARCHIVED';
}
