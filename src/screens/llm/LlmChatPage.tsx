'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useAppFrame } from '@/components/layout/AppFrameContext';
import { useNavigationGuard } from '@/components/layout/NavigationGuardContext';
import LlmComposer from '@/components/llm/chat/LlmComposer';
import LlmMessageList from '@/components/llm/chat/LlmMessageList';
import { getCurrentInterview } from '@/lib/api/llmRooms';
import { useLlmStreaming } from '@/lib/hooks/llm/useLlmStreaming';
import { useMessagesInfiniteQuery } from '@/lib/hooks/llm/useMessagesInfiniteQuery';
import { useStartInterviewMutation } from '@/lib/hooks/llm/useStartInterviewMutation';
import { toast } from '@/lib/toast/store';
import { toUIMessage } from '@/lib/utils/llm';

import type { UIMessage } from '@/lib/utils/llm';
import type { InterviewType, LlmModel } from '@/types/llm';

type Props = {
  roomId: string;
  numericRoomId: number;
  initialModel?: string | null;
};

const DEFAULT_MODEL: LlmModel = 'GEMINI';
function parseModel(value: string | null | undefined): LlmModel {
  if (value === 'GEMINI' || value === 'VLLM') {
    return value;
  }
  return DEFAULT_MODEL;
}

type InterviewSession = {
  interviewId: number;
  type: InterviewType;
  questionCount: number;
};

type InterviewUIState = 'idle' | 'select' | 'starting' | 'active' | 'ending';

export default function LlmChatPage({ roomId: _roomId, numericRoomId, initialModel }: Props) {
  const { setOptions, resetOptions } = useAppFrame();

  useEffect(() => {
    setOptions({ showBottomNav: false });
    return () => resetOptions();
  }, [resetOptions, setOptions]);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMessagesInfiniteQuery(numericRoomId);

  const startInterviewMutation = useStartInterviewMutation(numericRoomId);

  const serverMessages = useMemo<UIMessage[]>(() => {
    if (!data?.pages) return [];

    const allMessages = [...data.pages].reverse().flatMap((page) => page?.messages ?? []);
    return allMessages.map(toUIMessage);
  }, [data]);

  const {
    localMessages,
    streamingAiId,
    isSending,
    isRetryingEvaluation,
    sendMessage,
    streamEvaluation,
    streamInitialQuestion,
    retryMessage,
    deleteFailedMessage,
  } = useLlmStreaming(numericRoomId);

  const [interviewUIState, setInterviewUIState] = useState<InterviewUIState>('idle');
  const [interviewSession, setInterviewSession] = useState<InterviewSession | null>(null);
  const [model] = useState<LlmModel>(() => parseModel(initialModel));
  const [finishedEvaluationMessageId, setFinishedEvaluationMessageId] = useState<string | null>(
    null,
  );
  const notifiedDeletedRef = useRef(false);
  const { setBlocked, setBlockMessage } = useNavigationGuard();

  const errorStatus = (error as Error & { status?: number })?.status;
  const errorMessage = (error as Error | undefined)?.message ?? '';
  const isDeletedRoom = isError && (errorStatus === 404 || errorMessage.includes('채팅방'));

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

          setInterviewSession({
            interviewId: data.interviewId,
            type: data.interviewType,
            questionCount: data.currentQuestionCount ?? 0,
          });
          setInterviewUIState('active');
        }
      } catch {}
    };

    fetchCurrentInterview();

    return () => {
      isMounted = false;
    };
  }, [numericRoomId]);

  useEffect(() => {
    if (!isDeletedRoom || notifiedDeletedRef.current) return;
    notifiedDeletedRef.current = true;
    toast('삭제된 채팅방입니다.');
  }, [isDeletedRoom]);

  useEffect(() => {
    const isInterviewInProgress =
      interviewUIState === 'starting' ||
      interviewUIState === 'active' ||
      interviewUIState === 'ending';
    const shouldBlock = Boolean(streamingAiId) || isInterviewInProgress;

    if (shouldBlock) {
      setBlockMessage(
        streamingAiId
          ? '답변 생성 중에는 이동할 수 없습니다.'
          : '면접 진행 중에는 이동할 수 없습니다.',
      );
    } else {
      setBlockMessage('답변 생성 중에는 이동할 수 없습니다.');
    }

    setBlocked(shouldBlock);
    return () => setBlocked(false);
  }, [interviewUIState, setBlocked, setBlockMessage, streamingAiId]);

  const handleEndInterview = useCallback(
    async (options?: { userMessageId?: string; retry?: boolean; interviewId?: number }) => {
      const isRetry = options?.retry === true;
      const targetInterviewId = options?.interviewId ?? interviewSession?.interviewId ?? null;
      if (!targetInterviewId) return;

      if (!isRetry) {
        setInterviewUIState('ending');
      }

      await streamEvaluation({
        interviewId: targetInterviewId,
        retry: isRetry,
        userMessageId: options?.userMessageId,
        onActive: () => setInterviewUIState('active'),
        onIdle: () => setInterviewUIState('idle'),
        onSessionClear: () => setInterviewSession(null),
      });
    },
    [interviewSession, streamEvaluation],
  );

  const handleSendMessage = useCallback(
    async (text: string) => {
      await sendMessage(text, {
        model,
        interviewId: interviewSession?.interviewId ?? null,
        onQuestionCountIncrement: interviewSession
          ? () =>
              setInterviewSession((prev) =>
                prev ? { ...prev, questionCount: prev.questionCount + 1 } : null,
              )
          : undefined,
      });
    },
    [interviewSession, model, sendMessage],
  );

  const handleRetry = useCallback(
    (messageId: string) => retryMessage(messageId, handleSendMessage),
    [retryMessage, handleSendMessage],
  );

  const handleStartInterview = useCallback(
    (type: InterviewType) => {
      setInterviewUIState('starting');

      startInterviewMutation.mutate(
        {
          interviewType: type,
          model,
        },
        {
          onSuccess: async (response) => {
            if (!response) return;

            setInterviewSession({
              interviewId: response.interviewId,
              type: response.interviewType ?? type,
              questionCount: response.currentQuestionCount ?? 0,
            });
            setInterviewUIState('active');

            if (response.isResumed) {
              return;
            }

            await streamInitialQuestion({
              model,
              interviewId: response.interviewId,
              onQuestionCountSet: () =>
                setInterviewSession((prev) => (prev ? { ...prev, questionCount: 1 } : null)),
            });
          },
          onError: () => {
            toast('면접 모드 시작에 실패했습니다.');
            setInterviewUIState('idle');
          },
        },
      );
    },
    [startInterviewMutation, model, streamInitialQuestion],
  );

  const messages = useMemo<UIMessage[]>(
    () => [...serverMessages, ...localMessages],
    [serverMessages, localMessages],
  );
  const latestInterviewEvaluationMessage = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i].isInterviewEvaluation) {
        return messages[i];
      }
    }
    return null;
  }, [messages]);

  const handleRetryInterviewEvaluation = useCallback(() => {
    const targetInterviewId = latestInterviewEvaluationMessage?.interviewId;
    if (!targetInterviewId) {
      toast('재시도할 면접 평가 정보를 찾을 수 없습니다.');
      return;
    }
    void handleEndInterview({ retry: true, interviewId: targetInterviewId });
  }, [handleEndInterview, latestInterviewEvaluationMessage]);

  const handleFinishInterview = useCallback((messageId: string) => {
    setFinishedEvaluationMessageId(messageId);
    setInterviewSession(null);
    setInterviewUIState('idle');
  }, []);

  const isInterviewEvaluationActionsDisabled =
    (latestInterviewEvaluationMessage?.id !== null &&
      latestInterviewEvaluationMessage?.id !== undefined &&
      latestInterviewEvaluationMessage.id === finishedEvaluationMessageId) ||
    isRetryingEvaluation;

  const isComposerDisabled =
    isSending ||
    Boolean(streamingAiId) ||
    interviewUIState === 'starting' ||
    interviewUIState === 'ending';

  if (isLoading) {
    return (
      <main className="-mx-4 flex h-[calc(100dvh-56px-var(--bottom-nav-h))] items-center justify-center sm:-mx-6">
        <p className="text-sm text-neutral-500">메시지를 불러오는 중...</p>
      </main>
    );
  }

  if (isDeletedRoom) {
    return (
      <main className="-mx-4 flex h-[calc(100dvh-56px-var(--bottom-nav-h))] flex-col items-center justify-center gap-3 sm:-mx-6">
        <p className="text-sm text-neutral-500">삭제된 채팅방입니다.</p>
        <button
          type="button"
          onClick={() => (window.history.length > 1 ? window.history.back() : refetch())}
          className="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm hover:bg-neutral-50"
        >
          이전 화면으로
        </button>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="-mx-4 flex h-[calc(100dvh-56px-var(--bottom-nav-h))] flex-col items-center justify-center gap-3 sm:-mx-6">
        <p className="text-sm text-red-500">메시지를 불러오지 못했습니다.</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm hover:bg-neutral-50"
        >
          다시 시도
        </button>
      </main>
    );
  }

  return (
    <main className="-mx-4 flex h-[calc(100dvh-56px-var(--bottom-nav-h))] flex-col sm:-mx-6">
      <div className="flex min-h-0 flex-1 flex-col bg-white">
        <LlmMessageList
          messages={messages}
          streamingMessageId={streamingAiId}
          onLoadMore={() => fetchNextPage()}
          hasMore={hasNextPage}
          isLoadingMore={isFetchingNextPage}
          onRetry={handleRetry}
          onDeleteFailed={deleteFailedMessage}
          retryEvaluationMessageId={
            interviewUIState === 'idle' ? (latestInterviewEvaluationMessage?.id ?? null) : null
          }
          onRetryEvaluation={() => handleRetryInterviewEvaluation()}
          onFinishInterview={handleFinishInterview}
          isRetryEvaluationLoading={isRetryingEvaluation}
          isInterviewEvaluationActionsDisabled={isInterviewEvaluationActionsDisabled}
        />

        <div className="bg-white px-3 py-2">
          {interviewUIState === 'idle' && (
            <button
              type="button"
              onClick={() => setInterviewUIState('select')}
              className="w-full rounded-2xl border border-[#05C075] bg-white px-3 py-2.5 text-[12px] font-semibold text-[#05C075] shadow-sm hover:bg-[#05C075]/5"
            >
              면접 모드 시작
            </button>
          )}

          {interviewUIState === 'select' && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[#05C075]/30 bg-[#05C075]/10 px-3 py-1 text-[11px] font-semibold text-[#05C075]">
                면접 모드
              </span>
              <button
                type="button"
                onClick={() => handleStartInterview('BEHAVIOR')}
                className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-neutral-900 shadow-sm hover:border-[#05C075]/40 hover:bg-[#05C075]/5"
              >
                인성 면접
              </button>
              <button
                type="button"
                onClick={() => handleStartInterview('TECH')}
                className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-neutral-900 shadow-sm hover:border-[#05C075]/40 hover:bg-[#05C075]/5"
              >
                기술 면접
              </button>
              <button
                type="button"
                onClick={() => setInterviewUIState('idle')}
                className="ml-auto text-[11px] text-neutral-500 hover:text-neutral-700"
              >
                취소
              </button>
            </div>
          )}

          {interviewUIState === 'starting' && (
            <div className="flex items-center justify-center py-2">
              <span className="text-[12px] text-neutral-500">면접 모드 시작 중...</span>
            </div>
          )}

          {interviewUIState === 'active' && interviewSession && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[#05C075]/30 bg-[#05C075]/10 px-3 py-1 text-[11px] font-semibold text-[#05C075]">
                면접 모드 진행중
              </span>
              <span className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-[11px] font-semibold text-neutral-800 shadow-sm">
                {interviewSession.type === 'BEHAVIOR' ? '인성 면접' : '기술 면접'}
              </span>
              <button
                type="button"
                onClick={() => handleEndInterview()}
                className="ml-auto rounded-2xl border border-neutral-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-neutral-900 shadow-sm hover:bg-neutral-50"
              >
                면접 종료
              </button>
            </div>
          )}

          {interviewUIState === 'ending' && (
            <div className="flex items-center justify-center py-2">
              <span className="text-[12px] text-neutral-500">면접 종료 중...</span>
            </div>
          )}
        </div>

        <LlmComposer onSend={handleSendMessage} disabled={isComposerDisabled} />
      </div>
    </main>
  );
}
