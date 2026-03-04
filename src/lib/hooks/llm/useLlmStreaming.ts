'use client';

import { useCallback, useState } from 'react';

import { endInterviewStream, sendMessageStream } from '@/lib/api/llmRooms';
import { toast } from '@/lib/toast/store';
import { nowTimeLabel } from '@/lib/utils/datetime';
import { readSseStream } from '@/lib/utils/sse';

import type { UIMessage } from '@/lib/utils/llm';
import type { LlmModel } from '@/types/llm';

export function useLlmStreaming(numericRoomId: number) {
  // --- state ---

  const [localMessages, setLocalMessages] = useState<UIMessage[]>([]);
  const [streamingAiId, setStreamingAiId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isRetryingEvaluation, setIsRetryingEvaluation] = useState(false);

  // --- actions ---

  const removeLocalMessage = useCallback((id: string) => {
    setLocalMessages((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const sendMessage = useCallback(
    async (
      text: string,
      opts: {
        model: LlmModel;
        interviewId: number | null;
        onQuestionCountIncrement?: () => void;
      },
    ) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      setIsSending(true);

      const tempUserId = `temp-user-${Date.now()}`;
      const tempAiId = `temp-ai-${Date.now()}`;

      const pendingUserMessage: UIMessage = {
        id: tempUserId,
        role: 'USER',
        text: trimmed,
        time: nowTimeLabel(),
        status: 'sent',
      };

      const pendingAiMessage: UIMessage = {
        id: tempAiId,
        role: 'AI',
        text: '',
        time: '응답 중...',
      };

      setLocalMessages((prev) => [...prev, pendingUserMessage, pendingAiMessage]);
      setStreamingAiId(tempAiId);

      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });

      try {
        const response = await sendMessageStream(numericRoomId, {
          content: trimmed,
          model: opts.model,
          interviewId: opts.interviewId,
        });

        if (!response.ok) {
          throw new Error(`SSE 요청 실패 (HTTP ${response.status})`);
        }

        setLocalMessages((prev) =>
          prev.map((m) =>
            m.id === tempUserId ? { ...m, status: 'sent', time: nowTimeLabel() } : m,
          ),
        );

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

            setStreamingAiId((prev) => (prev === tempAiId ? null : prev));
            setLocalMessages((prev) =>
              prev.map((m) =>
                m.id === tempUserId
                  ? { ...m, status: 'failed', time: '전송 실패' }
                  : m.id === tempAiId
                    ? { ...m, text: errorMessage, time: nowTimeLabel() }
                    : m,
              ),
            );
            toast(errorMessage);
            return false;
          }

          if (event === 'done') {
            setStreamingAiId((prev) => (prev === tempAiId ? null : prev));
            setLocalMessages((prev) =>
              prev.map((m) => {
                if (m.id === tempUserId) return { ...m, status: 'sent', time: nowTimeLabel() };
                if (m.id === tempAiId) return { ...m, text: aiText, time: nowTimeLabel() };
                return m;
              }),
            );
            opts.onQuestionCountIncrement?.();
            return false;
          }

          aiText += data;
          setLocalMessages((prev) =>
            prev.map((m) => (m.id === tempAiId ? { ...m, text: aiText } : m)),
          );
          return true;
        });
      } catch {
        setStreamingAiId((prev) => (prev === tempAiId ? null : prev));
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
    [numericRoomId],
  );

  const streamEvaluation = useCallback(
    async (opts: {
      interviewId: number;
      retry?: boolean;
      userMessageId?: string;
      onActive?: () => void;
      onIdle?: () => void;
      onSessionClear?: () => void;
    }) => {
      const isRetry = opts.retry === true;

      if (isRetry) {
        setIsRetryingEvaluation(true);
      }

      const systemId = `sys-${Date.now()}`;
      const evalId = `temp-eval-${Date.now()}`;

      setStreamingAiId(evalId);
      setLocalMessages((prev) => [
        ...prev,
        ...(isRetry
          ? []
          : [
              {
                id: systemId,
                role: 'SYSTEM' as const,
                text: '면접이 종료되었습니다. 평가를 시작합니다.',
              },
            ]),
        {
          id: evalId,
          role: 'AI',
          text: '',
          time: '평가 중...',
          interviewId: opts.interviewId,
          isInterviewEvaluation: true,
        },
      ]);

      try {
        const response = await endInterviewStream(numericRoomId, {
          interviewId: opts.interviewId,
          retry: isRetry,
        });

        if (!response.ok) {
          throw new Error(`SSE 요청 실패 (HTTP ${response.status})`);
        }

        let evalText = '';

        await readSseStream(response, ({ event, data }) => {
          if (event === 'error') {
            let errorMessage = '면접 평가에 실패했습니다.';
            try {
              const parsed = JSON.parse(data) as { message?: string };
              if (parsed.message) errorMessage = parsed.message;
            } catch {
              errorMessage = data || errorMessage;
            }

            setStreamingAiId((prev) => (prev === evalId ? null : prev));
            setLocalMessages((prev) =>
              prev.map((m) => {
                if (m.id === evalId) return { ...m, text: errorMessage, time: nowTimeLabel() };
                if (m.id === opts.userMessageId)
                  return { ...m, status: 'failed', time: '전송 실패' };
                return m;
              }),
            );
            if (!isRetry) opts.onActive?.();
            toast(errorMessage);
            return false;
          }

          if (event === 'done') {
            setStreamingAiId((prev) => (prev === evalId ? null : prev));
            setLocalMessages((prev) =>
              prev.map((m) =>
                m.id === evalId ? { ...m, text: evalText, time: nowTimeLabel() } : m,
              ),
            );
            if (!isRetry) opts.onSessionClear?.();
            opts.onIdle?.();
            return false;
          }

          evalText += data;
          setLocalMessages((prev) =>
            prev.map((m) => (m.id === evalId ? { ...m, text: evalText } : m)),
          );
          return true;
        });
      } catch {
        toast(isRetry ? '면접 평가 재요청에 실패했습니다.' : '면접 종료에 실패했습니다.');
        if (!isRetry) opts.onActive?.();
        setStreamingAiId((prev) => (prev === evalId ? null : prev));
        if (opts.userMessageId) {
          setLocalMessages((prev) =>
            prev.map((m) =>
              m.id === opts.userMessageId ? { ...m, status: 'failed', time: '전송 실패' } : m,
            ),
          );
        }
      } finally {
        if (isRetry) {
          setIsRetryingEvaluation(false);
        }
      }
    },
    [numericRoomId],
  );

  const streamInitialQuestion = useCallback(
    async (opts: {
      model: LlmModel;
      interviewId: number;
      onQuestionCountSet?: () => void;
    }) => {
      const tempAiId = `temp-ai-interview-${Date.now()}`;
      setStreamingAiId(tempAiId);
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
          model: opts.model,
          interviewId: opts.interviewId,
        });

        if (!streamResponse.ok) {
          throw new Error(`SSE 요청 실패 (HTTP ${streamResponse.status})`);
        }

        let aiText = '';

        await readSseStream(streamResponse, ({ event, data }) => {
          if (event === 'error') {
            setStreamingAiId((prev) => (prev === tempAiId ? null : prev));
            setLocalMessages((prev) =>
              prev.map((m) =>
                m.id === tempAiId
                  ? { ...m, text: '질문 생성에 실패했습니다.', time: nowTimeLabel() }
                  : m,
              ),
            );
            return false;
          }

          if (event === 'done') {
            setStreamingAiId((prev) => (prev === tempAiId ? null : prev));
            setLocalMessages((prev) =>
              prev.map((m) =>
                m.id === tempAiId ? { ...m, text: aiText, time: nowTimeLabel() } : m,
              ),
            );
            opts.onQuestionCountSet?.();
            return false;
          }

          aiText += data;
          setLocalMessages((prev) =>
            prev.map((m) => (m.id === tempAiId ? { ...m, text: aiText } : m)),
          );
          return true;
        });
      } catch {
        setStreamingAiId((prev) => (prev === tempAiId ? null : prev));
        setLocalMessages((prev) => prev.filter((m) => m.id !== tempAiId));
        toast('면접 질문 생성에 실패했습니다.');
      }
    },
    [numericRoomId],
  );

  return {
    localMessages,
    streamingAiId,
    isSending,
    isRetryingEvaluation,
    sendMessage,
    streamEvaluation,
    streamInitialQuestion,
    removeLocalMessage,
  };
}
