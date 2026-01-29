'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

import { getTaskStatus } from '@/lib/api/llmRooms';
import { llmKeys } from '@/lib/hooks/llm/queryKeys';
import { notificationKeys } from '@/lib/hooks/notifications/queryKeys';
import { useAnalysisTaskStore } from '@/lib/llm/analysisTaskStore';
import { toast } from '@/lib/toast/store';

import type { ApiResponse } from '@/types/api';
import type { TaskResultData } from '@/types/llm';

const POLLING_INTERVAL = 2000;

export default function LlmAnalysisTaskWatcher() {
  const queryClient = useQueryClient();
  const { activeTask, updateStatus, clearActiveTask } = useAnalysisTaskStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const taskId = activeTask?.taskId;
    if (!taskId) return undefined;

    let isMounted = true;

    const poll = async () => {
      try {
        const response = await getTaskStatus(taskId);
        if (!response.ok || !response.json) {
          throw new Error('작업 상태 조회에 실패했습니다.');
        }

        const json = response.json as ApiResponse<TaskResultData>;
        const data = json.data;

        if (!isMounted) return;
        if (!data) {
          throw new Error('작업 상태 데이터가 없습니다.');
        }
        updateStatus(data.status);

        if (data.status === 'COMPLETED') {
          toast('분석이 완료되었습니다. 대화 목록에서 확인하세요.');
          clearActiveTask();
          queryClient.invalidateQueries({ queryKey: llmKeys.rooms() });
          queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
        } else if (data.status === 'FAILED') {
          toast('분석에 실패했습니다. 다시 시도해주세요.');
          clearActiveTask();
        }
      } catch (error) {
        if (!isMounted) return;
        toast(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
        clearActiveTask();
      }
    };

    poll();
    intervalRef.current = setInterval(poll, POLLING_INTERVAL);

    return () => {
      isMounted = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [activeTask?.taskId, clearActiveTask, queryClient, updateStatus]);

  return null;
}
