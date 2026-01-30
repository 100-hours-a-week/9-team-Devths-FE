export type ProgressSummary = {
  completedCount: number;
  totalCount: number;
  percent: number;
};

export function calcProgressFromCounts(
  completedCount: number,
  totalCount: number,
): ProgressSummary {
  const safeTotal = Math.max(0, totalCount);
  const safeCompleted = Math.min(Math.max(0, completedCount), safeTotal);
  const rawPercent = safeTotal === 0 ? 0 : Math.round((safeCompleted / safeTotal) * 100);
  const percent = Math.min(100, Math.max(0, rawPercent));

  return {
    completedCount: safeCompleted,
    totalCount: safeTotal,
    percent,
  };
}

export function calcCompletionProgress<T extends { isCompleted: boolean }>(
  items: T[],
): ProgressSummary {
  const totalCount = items.length;
  const completedCount = items.reduce((count, item) => count + (item.isCompleted ? 1 : 0), 0);

  return calcProgressFromCounts(completedCount, totalCount);
}
