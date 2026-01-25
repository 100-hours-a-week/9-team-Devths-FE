'use client';

import { useEffect, useMemo, useState } from 'react';

import { useAppFrame } from '@/components/layout/AppFrameContext';
import LlmAttachmentSheet from '@/components/llm/chat/LlmAttachmentSheet';
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

type InterviewMode = 'PERSONAL' | 'TECH';
type InterviewState = 'idle' | 'select' | 'active';

export default function LlmChatPage({ roomId: _roomId }: Props) {
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
        id: 'u-attach-1',
        role: 'USER',
        text: '이력서와 포트폴리오 첨부했어요.',
        time: '오후 8:12',
        attachments: [
          { type: 'image', name: 'resume-01.png' },
          { type: 'file', name: 'portfolio.pdf' },
        ],
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
  const [sheetOpen, setSheetOpen] = useState(false);
  const [interviewState, setInterviewState] = useState<InterviewState>('idle');
  const [interviewMode, setInterviewMode] = useState<InterviewMode | null>(null);

  return (
    <main className="-mx-4 flex h-[calc(100dvh-56px-var(--bottom-nav-h))] flex-col sm:-mx-6">
      <div className="flex min-h-0 flex-1 flex-col bg-neutral-50">
        <LlmMessageList messages={messages} />

        <div className="border-t bg-white px-3 py-2">
          {interviewState === 'idle' ? (
            <button
              type="button"
              onClick={() => setInterviewState('select')}
              className="w-full rounded-2xl border border-neutral-200 bg-white px-3 py-2.5 text-[12px] font-semibold text-neutral-900 shadow-sm hover:bg-neutral-50"
            >
              면접 모드 시작
            </button>
          ) : null}

          {interviewState === 'select' ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-[11px] font-semibold text-neutral-600">
                면접 모드
              </span>
              <button
                type="button"
                onClick={() => {
                  setInterviewMode('PERSONAL');
                  setInterviewState('active');
                  setMessages((prev) => [
                    ...prev,
                    {
                      id: `sys-${Date.now()}`,
                      role: 'SYSTEM',
                      text: '면접 모드 진행중: 인성 면접',
                    },
                  ]);
                }}
                className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-neutral-900 shadow-sm hover:bg-neutral-50"
              >
                인성 면접
              </button>
              <button
                type="button"
                onClick={() => {
                  setInterviewMode('TECH');
                  setInterviewState('active');
                  setMessages((prev) => [
                    ...prev,
                    {
                      id: `sys-${Date.now()}`,
                      role: 'SYSTEM',
                      text: '면접 모드 진행중: 기술 면접',
                    },
                  ]);
                }}
                className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-neutral-900 shadow-sm hover:bg-neutral-50"
              >
                기술 면접
              </button>
            </div>
          ) : null}

          {interviewState === 'active' ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-[11px] font-semibold text-neutral-600">
                면접 모드 진행중
              </span>
              <span className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-[11px] font-semibold text-neutral-800 shadow-sm">
                {interviewMode === 'PERSONAL' ? '인성 면접' : '기술 면접'}
              </span>
              <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-[11px] font-semibold text-neutral-600">
                질문 0/5
              </span>
              <button
                type="button"
                onClick={() => {
                  setInterviewState('idle');
                  setInterviewMode(null);
                  setMessages((prev) => [
                    ...prev,
                    {
                      id: `sys-${Date.now()}`,
                      role: 'SYSTEM',
                      text: '면접 모드가 종료되었습니다.',
                    },
                  ]);
                }}
                className="ml-auto rounded-2xl border border-neutral-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-neutral-900 shadow-sm hover:bg-neutral-50"
              >
                면접 종료
              </button>
            </div>
          ) : null}
        </div>

        <LlmComposer
          onAttach={() => setSheetOpen(true)}
          onSend={(text) => {
            setMessages((prev) => [
              ...prev,
              { id: `u-${Date.now()}`, role: 'USER', text, time: '방금' },
            ]);
          }}
        />
      </div>

      <LlmAttachmentSheet
        open={sheetOpen}
        title="채팅 첨부"
        onClose={() => setSheetOpen(false)}
        onPickImages={() => {
          // TODO: 실제 첨부 로직은 다음 커밋
        }}
        onPickFile={() => {
          // TODO: 실제 첨부 로직은 다음 커밋
        }}
      />
    </main>
  );
}
