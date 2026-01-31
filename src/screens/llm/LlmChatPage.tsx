'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useAppFrame } from '@/components/layout/AppFrameContext';
import LlmComposer from '@/components/llm/chat/LlmComposer';
import LlmMessageList from '@/components/llm/chat/LlmMessageList';
import { endInterviewStream, sendMessageStream } from '@/lib/api/llmRooms';
import { useMessagesInfiniteQuery } from '@/lib/hooks/llm/useMessagesInfiniteQuery';
import { useStartInterviewMutation } from '@/lib/hooks/llm/useStartInterviewMutation';
import { toast } from '@/lib/toast/store';
import { toUIMessage } from '@/lib/utils/llm';
import { readSseStream } from '@/lib/utils/sse';

import type { UIMessage } from '@/lib/utils/llm';
import type { InterviewType, LlmModel } from '@/types/llm';

type Props = {
  roomId: string;
  numericRoomId: number;
  initialModel?: string | null;
};

const MAX_QUESTIONS = 5;
const DEFAULT_MODEL: LlmModel = 'GEMINI';
const FINAL_ANSWER_TIMEOUT_MS = 30_000;

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

    const allMessages = data.pages.flatMap((page) => page?.messages ?? []);
    return allMessages.map(toUIMessage);
  }, [data]);

  const [localMessages, setLocalMessages] = useState<UIMessage[]>([]);

  const [interviewUIState, setInterviewUIState] = useState<InterviewUIState>('idle');
  const [interviewSession, setInterviewSession] = useState<InterviewSession | null>(null);
  const [model] = useState<LlmModel>(() => parseModel(initialModel));
  const [isSending, setIsSending] = useState(false);
  const notifiedDeletedRef = useRef(false);

  const errorStatus = (error as Error & { status?: number })?.status;
  const errorMessage = (error as Error | undefined)?.message ?? '';
  const isDeletedRoom = isError && (errorStatus === 404 || errorMessage.includes('채팅방'));

  useEffect(() => {
    if (!isDeletedRoom || notifiedDeletedRef.current) return;
    notifiedDeletedRef.current = true;
    toast('삭제된 채팅방입니다.');
  }, [isDeletedRoom]);

  const handleEndInterview = useCallback(async () => {
    if (!interviewSession) return;

    setInterviewUIState('ending');

    const systemId = `sys-${Date.now()}`;
    const evalId = `temp-eval-${Date.now()}`;

    setLocalMessages((prev) => [
      ...prev,
      {
        id: systemId,
        role: 'SYSTEM',
        text: '면접이 종료되었습니다. 답변 평가를 시작합니다.',
      },
      {
        id: evalId,
        role: 'AI',
        text: '',
        time: '평가 중...',
      },
    ]);

    try {
      const response = await endInterviewStream(numericRoomId, {
        interviewId: interviewSession.interviewId,
      });

      let evalText = '';
      const nowLabel = () =>
        new Date().toLocaleTimeString('ko-KR', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });

      await readSseStream(response, ({ event, data }) => {
        if (event === 'error') {
          let errorMessage = '면접 평가에 실패했습니다.';
          try {
            const parsed = JSON.parse(data) as { message?: string };
            if (parsed.message) errorMessage = parsed.message;
          } catch {
            errorMessage = data || errorMessage;
          }

          setLocalMessages((prev) =>
            prev.map((m) => (m.id === evalId ? { ...m, text: errorMessage, time: nowLabel() } : m)),
          );
          toast(errorMessage);
          return false;
        }

        if (event === 'done') {
          setLocalMessages((prev) =>
            prev.map((m) => (m.id === evalId ? { ...m, text: evalText, time: nowLabel() } : m)),
          );
          setInterviewSession(null);
          setInterviewUIState('idle');
          return false;
        }

        evalText += data;
        setLocalMessages((prev) =>
          prev.map((m) => (m.id === evalId ? { ...m, text: evalText } : m)),
        );
        return true;
      });
    } catch {
      toast('면접 종료에 실패했습니다.');
      setInterviewUIState('active');
    }
  }, [interviewSession, numericRoomId]);

  const handleSendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();

      if (!trimmed) return;

      setIsSending(true);

      const questionCount = interviewSession?.questionCount ?? 0;
      const isFinalAnswer = Boolean(interviewSession) && questionCount >= MAX_QUESTIONS;

      const tempUserId = `temp-user-${Date.now()}`;
      const tempAiId = `temp-ai-${Date.now()}`;

      const pendingUserMessage: UIMessage = {
        id: tempUserId,
        role: 'USER',
        text: trimmed,
        time: '전송 중...',
        status: 'sending',
      };

      const pendingAiMessage: UIMessage = {
        id: tempAiId,
        role: 'AI',
        text: '',
        time: '응답 중...',
      };

      setLocalMessages((prev) => [
        ...prev,
        pendingUserMessage,
        ...(isFinalAnswer ? [] : [pendingAiMessage]),
      ]);

      try {
        const response = await sendMessageStream(numericRoomId, {
          content: trimmed,
          model,
          interviewId: interviewSession?.interviewId ?? null,
        });

        const nowLabel = () =>
          new Date().toLocaleTimeString('ko-KR', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          });

        if (isFinalAnswer) {
          if (!response.ok) {
            throw new Error(`SSE 요청 실패 (HTTP ${response.status})`);
          }

          let timeoutId: number | null = null;
          let didComplete = false;
          let didFail = false;

          const timeoutPromise = new Promise<'timeout'>((resolve) => {
            timeoutId = window.setTimeout(() => resolve('timeout'), FINAL_ANSWER_TIMEOUT_MS);
          });

          const streamPromise = readSseStream(response, ({ event, data }) => {
            if (event === 'error') {
              didFail = true;
              let errorMessage = '메시지 전송에 실패했습니다.';
              try {
                const parsed = JSON.parse(data) as { message?: string };
                if (parsed.message) errorMessage = parsed.message;
              } catch {
                errorMessage = data || errorMessage;
              }

              setLocalMessages((prev) =>
                prev.map((m) =>
                  m.id === tempUserId ? { ...m, status: 'failed', time: '전송 실패' } : m,
                ),
              );
              toast(errorMessage);
              return false;
            }

            if (event === 'done') {
              didComplete = true;
              setLocalMessages((prev) =>
                prev.map((m) =>
                  m.id === tempUserId ? { ...m, status: 'sent', time: nowLabel() } : m,
                ),
              );
              void handleEndInterview();
              return false;
            }

            return true;
          }).then(() => 'stream' as const);

          const raceResult = await Promise.race([streamPromise, timeoutPromise]);

          if (timeoutId !== null) {
            window.clearTimeout(timeoutId);
          }

          if (!didComplete && !didFail) {
            setLocalMessages((prev) =>
              prev.map((m) =>
                m.id === tempUserId ? { ...m, status: 'failed', time: '전송 실패' } : m,
              ),
            );
            toast(
              raceResult === 'timeout'
                ? '응답 대기 시간이 초과되었습니다. 다시 시도해주세요.'
                : '응답이 완료되지 않아 전송에 실패했습니다.',
            );
            try {
              await response.body?.cancel();
            } catch {
              // ignore cancel errors
            }
          }

          return;
        }

        let aiText = '';

        await readSseStream(response, ({ event, data }) => {
          if (event === 'error') {
            let errorMessage = '메시지 전송에 실패했습니다.';
            try {
              const parsed = JSON.parse(data) as { message?: string };
              if (parsed.message) errorMessage = parsed.message;
            } catch {
              errorMessage = data || errorMessage;
            }

            setLocalMessages((prev) =>
              prev.map((m) =>
                m.id === tempUserId
                  ? { ...m, status: 'failed', time: '전송 실패' }
                  : m.id === tempAiId
                    ? { ...m, text: errorMessage, time: nowLabel() }
                    : m,
              ),
            );
            toast(errorMessage);
            return false;
          }

          if (event === 'done') {
            setLocalMessages((prev) =>
              prev.map((m) => {
                if (m.id === tempUserId) {
                  return { ...m, status: 'sent', time: nowLabel() };
                }
                if (m.id === tempAiId) {
                  return { ...m, text: aiText, time: nowLabel() };
                }
                return m;
              }),
            );

            if (interviewSession && interviewSession.questionCount < MAX_QUESTIONS) {
              const newCount = interviewSession.questionCount + 1;
              setInterviewSession((prev) => (prev ? { ...prev, questionCount: newCount } : null));
            }

            return false;
          }

          aiText += data;
          setLocalMessages((prev) =>
            prev.map((m) => (m.id === tempAiId ? { ...m, text: aiText } : m)),
          );

          return true;
        });
      } catch {
        setLocalMessages((prev) =>
          prev
            .filter((m) => m.id !== tempAiId)
            .map((m) => (m.id === tempUserId ? { ...m, status: 'failed', time: '전송 실패' } : m)),
        );
        toast('메시지 전송에 실패했습니다.');
      } finally {
        setIsSending(false);
      }
    },
    [handleEndInterview, interviewSession, model, numericRoomId],
  );

  const handleRetry = useCallback(
    (messageId: string) => {
      const failedMessage = localMessages.find((m) => m.id === messageId);
      if (!failedMessage) return;

      setLocalMessages((prev) => prev.filter((m) => m.id !== messageId));
      handleSendMessage(failedMessage.text);
    },
    [localMessages, handleSendMessage],
  );

  const handleDeleteFailed = useCallback((messageId: string) => {
    setLocalMessages((prev) => prev.filter((m) => m.id !== messageId));
  }, []);

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
              type,
              questionCount: 0,
            });
            setInterviewUIState('active');

            const tempAiId = `temp-ai-interview-${Date.now()}`;
            setLocalMessages((prev) => [
              ...prev,
              {
                id: tempAiId,
                role: 'AI',
                text: '',
                time: '질문 생성 중...',
              },
            ]);

            try {
              const streamResponse = await sendMessageStream(numericRoomId, {
                content: '면접을 시작해주세요.',
                model,
                interviewId: response.interviewId,
              });

              let aiText = '';
              const nowLabel = () =>
                new Date().toLocaleTimeString('ko-KR', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                });

              await readSseStream(streamResponse, ({ event, data }) => {
                if (event === 'error') {
                  setLocalMessages((prev) =>
                    prev.map((m) =>
                      m.id === tempAiId
                        ? { ...m, text: '질문 생성에 실패했습니다.', time: nowLabel() }
                        : m,
                    ),
                  );
                  return false;
                }

                if (event === 'done') {
                  setLocalMessages((prev) =>
                    prev.map((m) =>
                      m.id === tempAiId ? { ...m, text: aiText, time: nowLabel() } : m,
                    ),
                  );
                  setInterviewSession((prev) => (prev ? { ...prev, questionCount: 1 } : null));
                  return false;
                }

                aiText += data;
                setLocalMessages((prev) =>
                  prev.map((m) => (m.id === tempAiId ? { ...m, text: aiText } : m)),
                );
                return true;
              });
            } catch {
              setLocalMessages((prev) => prev.filter((m) => m.id !== tempAiId));
              toast('면접 질문 생성에 실패했습니다.');
            }
          },
          onError: () => {
            toast('면접 모드 시작에 실패했습니다.');
            setInterviewUIState('idle');
          },
        },
      );
    },
    [startInterviewMutation, model, numericRoomId],
  );

  const messages = useMemo<UIMessage[]>(
    () => [...serverMessages, ...localMessages],
    [serverMessages, localMessages],
  );

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
      <div className="flex min-h-0 flex-1 flex-col bg-neutral-50">
        <LlmMessageList
          messages={messages}
          onLoadMore={() => fetchNextPage()}
          hasMore={hasNextPage}
          isLoadingMore={isFetchingNextPage}
          onRetry={handleRetry}
          onDeleteFailed={handleDeleteFailed}
        />

        <div className="border-t bg-white px-3 py-2">
          {interviewUIState === 'idle' && (
            <button
              type="button"
              onClick={() => setInterviewUIState('select')}
              className="w-full rounded-2xl border border-neutral-200 bg-white px-3 py-2.5 text-[12px] font-semibold text-neutral-900 shadow-sm hover:bg-neutral-50"
            >
              면접 모드 시작
            </button>
          )}

          {interviewUIState === 'select' && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-[11px] font-semibold text-neutral-600">
                면접 모드
              </span>
              <button
                type="button"
                onClick={() => handleStartInterview('BEHAVIOR')}
                className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-neutral-900 shadow-sm hover:bg-neutral-50"
              >
                인성 면접
              </button>
              <button
                type="button"
                onClick={() => handleStartInterview('TECH')}
                className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-neutral-900 shadow-sm hover:bg-neutral-50"
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
              <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-[11px] font-semibold text-neutral-600">
                면접 모드 진행중
              </span>
              <span className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-[11px] font-semibold text-neutral-800 shadow-sm">
                {interviewSession.type === 'BEHAVIOR' ? '인성 면접' : '기술 면접'}
              </span>
              <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-[11px] font-semibold text-neutral-600">
                질문 {interviewSession.questionCount}/{MAX_QUESTIONS}
              </span>
              <button
                type="button"
                onClick={handleEndInterview}
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

        <LlmComposer onSend={handleSendMessage} disabled={isSending} />
      </div>
    </main>
  );
}
