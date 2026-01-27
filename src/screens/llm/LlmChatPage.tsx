'use client';

import { useEffect, useMemo, useState } from 'react';

import { useAppFrame } from '@/components/layout/AppFrameContext';
import LlmAttachmentSheet from '@/components/llm/chat/LlmAttachmentSheet';
import LlmComposer from '@/components/llm/chat/LlmComposer';
import LlmMessageList from '@/components/llm/chat/LlmMessageList';
import { useMessagesInfiniteQuery } from '@/lib/hooks/llm/useMessagesInfiniteQuery';
import { toUIMessage } from '@/lib/utils/llm';

import type { UIMessage } from '@/lib/utils/llm';

type Props = {
  roomId: string;
  numericRoomId: number;
};

type InterviewMode = 'PERSONAL' | 'TECH';
type InterviewState = 'idle' | 'select' | 'active';

export default function LlmChatPage({ roomId: _roomId, numericRoomId }: Props) {
  const { setOptions, resetOptions } = useAppFrame();

  useEffect(() => {
    setOptions({ showBottomNav: false });
    return () => resetOptions();
  }, [resetOptions, setOptions]);

  const { data, isLoading, isError } = useMessagesInfiniteQuery(numericRoomId);

  // 서버 메시지를 UI 메시지로 변환 (API가 ASC 정렬 = 과거→최신)
  const serverMessages = useMemo<UIMessage[]>(() => {
    if (!data?.pages) return [];

    const allMessages = data.pages.flatMap((page) => page?.messages ?? []);
    return allMessages.map(toUIMessage);
  }, [data]);

  const [localMessages, setLocalMessages] = useState<UIMessage[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [interviewState, setInterviewState] = useState<InterviewState>('idle');
  const [interviewMode, setInterviewMode] = useState<InterviewMode | null>(null);

  // 서버 메시지 + 로컬 메시지 합치기
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

  if (isError) {
    return (
      <main className="-mx-4 flex h-[calc(100dvh-56px-var(--bottom-nav-h))] items-center justify-center sm:-mx-6">
        <p className="text-sm text-red-500">메시지를 불러오지 못했습니다.</p>
      </main>
    );
  }

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
                  setLocalMessages((prev) => [
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
                  setLocalMessages((prev) => [
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
                  setLocalMessages((prev) => [
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
            setLocalMessages((prev) => [
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
