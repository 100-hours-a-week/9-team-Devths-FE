'use client';

import { useEffect, useMemo, useState } from 'react';

import { useAppFrame } from '@/components/layout/AppFrameContext';
import LlmComposer from '@/components/llm/chat/LlmComposer';
import LlmMessageList from '@/components/llm/chat/LlmMessageList';

type Props = {
  roomId: string;
};

type Message = {
  id: string;
  role: 'USER' | 'AI' | 'SYSTEM';
  text: string;
  time?: string;
};

export default function LlmChatPage({ roomId }: Props) {
  const { setOptions, resetOptions } = useAppFrame();

  useEffect(() => {
    setOptions({ showBottomNav: false });
    return () => resetOptions();
  }, [resetOptions, setOptions]);

  const initialMessages = useMemo<Message[]>(
    () => [
      { id: 'sys-1', role: 'SYSTEM', text: '대화를 시작할 준비가 되었어요.' },
      {
        id: 'ai-1',
        role: 'AI',
        text: '요약 결과입니다.\n• 핵심 강점: 실무 프로젝트 경험이 풍부하며 협업 도구 활용 능력이 뛰어납니다.\n• 보완 포인트: 성과 지표를 수치화해 기여도를 명확히 보여주세요.\n• 추천 방향: 지원 직무와 맞닿은 기술 스택을 상단에 배치하세요.',
        time: '오후 8:10',
      },
      {
        id: 'u-1',
        role: 'USER',
        text: '백엔드 포지션 지원하려고 해. 어떤 점을 보완하면 좋을까?',
        time: '오후 8:11',
      },
      {
        id: 'ai-2',
        role: 'AI',
        text: '좋아요. 먼저 프로젝트 경험을 STAR 구조로 정리해볼까요?',
        time: '오후 8:12',
      },
    ],
    [],
  );

  const [messages, setMessages] = useState<Message[]>(initialMessages);

  return (
    <main className="flex h-[calc(100dvh-56px-var(--bottom-nav-h))] flex-col">
      <div className="flex min-h-0 flex-1 flex-col rounded-2xl bg-neutral-50">
        <LlmMessageList messages={messages} />

        <LlmComposer
          onSend={(text) => {
            setMessages((prev) => [
              ...prev,
              { id: `u-${Date.now()}`, role: 'USER', text, time: '방금' },
            ]);
          }}
        />
      </div>

      <p className="mt-2 px-2 text-[11px] text-neutral-400">roomId: {roomId}</p>
    </main>
  );
}
