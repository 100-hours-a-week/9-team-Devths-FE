'use client';

import { useCallback, useEffect, useState } from 'react';

import { getCurrentInterview } from '@/lib/api/llmRooms';
import { useStartInterviewMutation } from '@/lib/hooks/llm/useStartInterviewMutation';
import { toast } from '@/lib/toast/store';

import type { InterviewType, LlmModel } from '@/types/llm';

export type InterviewSession = {
  interviewId: number;
  type: InterviewType;
  questionCount: number;
};

export type InterviewUIState = 'idle' | 'select' | 'starting' | 'active' | 'ending';

type StreamEvaluationFn = (opts: {
  interviewId: number;
  retry?: boolean;
  userMessageId?: string;
  onActive?: () => void;
  onIdle?: () => void;
  onSessionClear?: () => void;
}) => Promise<void>;

type StreamInitialQuestionFn = (opts: {
  model: LlmModel;
  interviewId: number;
  onQuestionCountSet?: () => void;
}) => Promise<void>;

export function useInterviewSession(
  numericRoomId: number,
  model: LlmModel,
  streamEvaluation: StreamEvaluationFn,
  streamInitialQuestion: StreamInitialQuestionFn,
) {
  // --- state ---

  const [uiState, setUIState] = useState<InterviewUIState>('idle');
  const [session, setSession] = useState<InterviewSession | null>(null);

  // --- queries ---

  useEffect(() => {
    let isMounted = true;

    const fetchCurrentInterview = async () => {
      if (numericRoomId <= 0) return;
      try {
        const result = await getCurrentInterview(numericRoomId);
        if (!isMounted || !result.ok || !result.json) return;

        if ('data' in result.json) {
          const data = result.json.data;
          if (!data) return;

          setSession({
            interviewId: data.interviewId,
            type: data.interviewType,
            questionCount: data.currentQuestionCount ?? 0,
          });
          setUIState('active');
        }
      } catch {}
    };

    fetchCurrentInterview();

    return () => {
      isMounted = false;
    };
  }, [numericRoomId]);

  // --- actions ---

  const startInterviewMutation = useStartInterviewMutation(numericRoomId);

  const enterSelect = useCallback(() => setUIState('select'), []);

  const cancelSelect = useCallback(() => setUIState('idle'), []);

  const finishSession = useCallback(() => {
    setSession(null);
    setUIState('idle');
  }, []);

  const incrementQuestionCount = useCallback(() => {
    setSession((prev) => (prev ? { ...prev, questionCount: prev.questionCount + 1 } : null));
  }, []);

  const startInterview = useCallback(
    (type: InterviewType) => {
      setUIState('starting');

      startInterviewMutation.mutate(
        { interviewType: type, model },
        {
          onSuccess: async (response) => {
            if (!response) return;

            setSession({
              interviewId: response.interviewId,
              type: response.interviewType ?? type,
              questionCount: response.currentQuestionCount ?? 0,
            });
            setUIState('active');

            if (response.isResumed) return;

            await streamInitialQuestion({
              model,
              interviewId: response.interviewId,
              onQuestionCountSet: () =>
                setSession((prev) => (prev ? { ...prev, questionCount: 1 } : null)),
            });
          },
          onError: () => {
            toast('면접 모드 시작에 실패했습니다.');
            setUIState('idle');
          },
        },
      );
    },
    [startInterviewMutation, model, streamInitialQuestion],
  );

  const endInterview = useCallback(
    async (options?: { userMessageId?: string; retry?: boolean; interviewId?: number }) => {
      const isRetry = options?.retry === true;
      const targetInterviewId = options?.interviewId ?? session?.interviewId ?? null;
      if (!targetInterviewId) return;

      if (!isRetry) {
        setUIState('ending');
      }

      await streamEvaluation({
        interviewId: targetInterviewId,
        retry: isRetry,
        userMessageId: options?.userMessageId,
        onActive: () => setUIState('active'),
        onIdle: () => setUIState('idle'),
        onSessionClear: () => setSession(null),
      });
    },
    [session, streamEvaluation],
  );

  return {
    uiState,
    session,
    enterSelect,
    cancelSelect,
    finishSession,
    incrementQuestionCount,
    startInterview,
    endInterview,
  };
}
