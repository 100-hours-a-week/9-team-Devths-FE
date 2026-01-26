import { useCallback, useEffect, useRef, useState } from 'react';

import { getTaskStatus } from '@/lib/api/llmRooms';

import type { ApiResponse } from '@/types/api';
import type { TaskResultData, TaskStatus } from '@/types/llm';

const POLLING_INTERVAL = 2000;

export type UseTaskPollingResult = {
  status: TaskStatus | null;
  result: TaskResultData | null;
  error: string | null;
  isPolling: boolean;
  startPolling: (taskId: number) => void;
  stopPolling: () => void;
};

export function useTaskPolling(): UseTaskPollingResult {
  const [status, setStatus] = useState<TaskStatus | null>(null);
  const [result, setResult] = useState<TaskResultData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  const taskIdRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPolling(false);
  }, []);

  const poll = useCallback(async () => {
    if (taskIdRef.current === null) return;

    try {
      const response = await getTaskStatus(taskIdRef.current);

      if (!response.ok || !response.json) {
        throw new Error('작업 상태 조회에 실패했습니다.');
      }

      const json = response.json as ApiResponse<TaskResultData>;
      const data = json.data;

      setStatus(data.status);

      if (data.status === 'COMPLETED') {
        setResult(data);
        stopPolling();
      } else if (data.status === 'FAILED') {
        setError(data.failMessage || '분석에 실패했습니다.');
        setResult(data);
        stopPolling();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      stopPolling();
    }
  }, [stopPolling]);

  const startPolling = useCallback(
    (taskId: number) => {
      taskIdRef.current = taskId;
      setStatus('PENDING');
      setResult(null);
      setError(null);
      setIsPolling(true);

      poll();

      intervalRef.current = setInterval(poll, POLLING_INTERVAL);
    },
    [poll],
  );

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    status,
    result,
    error,
    isPolling,
    startPolling,
    stopPolling,
  };
}
