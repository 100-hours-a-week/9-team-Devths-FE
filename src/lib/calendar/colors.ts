import type { InterviewStage } from '@/types/calendar';

export const stageColorMap: Record<InterviewStage, string> = {
  DOCUMENT: '#05C075',
  CODING_TEST: '#F4C430',
  INTERVIEW: '#3B82F6',
};

export function getStageColor(stage?: InterviewStage) {
  if (!stage) return '#A1A1AA';
  return stageColorMap[stage] ?? '#A1A1AA';
}
