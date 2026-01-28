import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useRef, useState } from 'react';

import { streamMessage, type StreamMessageCallbacks } from '@/lib/api/llmRooms';
import { llmKeys } from '@/lib/hooks/llm/queryKeys';

import type { LlmModel } from '@/types/llm';

type StreamState = 'idle' | 'streaming' | 'error';

type UseStreamMessageReturn = {
  streamingText: string;
  streamState: StreamState;
  send: (content: string, model?: LlmModel) => Promise<void>;
  reset: () => void;
};

export function useStreamMessage(roomId: number): UseStreamMessageReturn {
  const queryClient = useQueryClient();

  const [streamingText, setStreamingText] = useState('');
  const [streamState, setStreamState] = useState<StreamState>('idle');

  const abortRef = useRef(false);

  const reset = useCallback(() => {
    setStreamingText('');
    setStreamState('idle');
    abortRef.current = false;
  }, []);

  const send = useCallback(
    async (content: string, model: LlmModel = 'GEMINI') => {
      if (streamState === 'streaming') return;

      reset();
      setStreamState('streaming');

      const callbacks: StreamMessageCallbacks = {
        onChunk: (_chunk: string, accumulated: string) => {
          if (abortRef.current) return;
          setStreamingText(accumulated);
        },
        onDone: () => {
          setStreamState('idle');
          // 백엔드에서 메시지 저장 완료 후 쿼리 갱신
          queryClient.invalidateQueries({ queryKey: llmKeys.messages(roomId) });
        },
        onError: (error) => {
          setStreamState('error');
          console.error('Stream error:', error);
        },
      };

      try {
        await streamMessage(roomId, { content, model }, callbacks);
      } catch (error) {
        setStreamState('error');
        console.error('Stream failed:', error);
      }
    },
    [roomId, streamState, reset, queryClient],
  );

  return {
    streamingText,
    streamState,
    send,
    reset,
  };
}
