import type { InterviewStage } from '@/types/calendar';

export const stageColorMap: Record<InterviewStage, string> = {
  DOCUMENT: '#3B82F6',
  CODING_TEST: '#8B5CF6',
  INTERVIEW: '#22C55E',
};

export function getStageColor(stage?: InterviewStage) {
  if (!stage) return '#A1A1AA';
  return stageColorMap[stage] ?? '#A1A1AA';
}
