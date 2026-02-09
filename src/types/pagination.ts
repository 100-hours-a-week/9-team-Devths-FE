export type CursorPage<T> = {
  items: T[];
  lastId: number | null;
  hasNext: boolean;
};
