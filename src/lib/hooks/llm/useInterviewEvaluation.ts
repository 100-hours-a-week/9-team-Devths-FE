'use client';

import { useCallback, useMemo, useState } from 'react';

import { toast } from '@/lib/toast/store';

import type { UIMessage } from '@/lib/utils/llm';

export function useInterviewEvaluation(
  messages: UIMessage[],
  isRetryingEvaluation: boolean,
  onEndInterview: (opts: { retry?: boolean; interviewId?: number }) => void,
  onFinishSession: () => void,
) {
  const [finishedEvaluationMessageId, setFinishedEvaluationMessageId] = useState<string | null>(
    null,
  );

  const latestInterviewEvaluationMessage = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i].isInterviewEvaluation) {
        return messages[i];
      }
    }
    return null;
  }, [messages]);

  const isEvaluationAlreadyFinished =
    latestInterviewEvaluationMessage?.id !== null &&
    latestInterviewEvaluationMessage?.id !== undefined &&
    latestInterviewEvaluationMessage.id === finishedEvaluationMessageId;

  const isActionsDisabled = isEvaluationAlreadyFinished || isRetryingEvaluation;

  const retryEvaluation = useCallback(() => {
    const targetInterviewId = latestInterviewEvaluationMessage?.interviewId;
    if (!targetInterviewId) {
      toast('재시도할 면접 평가 정보를 찾을 수 없습니다.');
      return;
    }
    onEndInterview({ retry: true, interviewId: targetInterviewId });
  }, [latestInterviewEvaluationMessage, onEndInterview]);

  const finishInterview = useCallback(
    (messageId: string) => {
      setFinishedEvaluationMessageId(messageId);
      onFinishSession();
    },
    [onFinishSession],
  );

  return {
    latestInterviewEvaluationMessage,
    isActionsDisabled,
    retryEvaluation,
    finishInterview,
  };
}
