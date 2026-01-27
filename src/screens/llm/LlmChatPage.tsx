'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useAppFrame } from '@/components/layout/AppFrameContext';
import LlmAttachmentSheet from '@/components/llm/chat/LlmAttachmentSheet';
import LlmComposer from '@/components/llm/chat/LlmComposer';
import LlmMessageList from '@/components/llm/chat/LlmMessageList';
import { CHAT_ATTACHMENT_CONSTRAINTS, IMAGE_MIME_TYPES } from '@/constants/attachment';
import { useEndInterviewMutation } from '@/lib/hooks/llm/useEndInterviewMutation';
import { useMessagesInfiniteQuery } from '@/lib/hooks/llm/useMessagesInfiniteQuery';
import { useSendMessageMutation } from '@/lib/hooks/llm/useSendMessageMutation';
import { useStartInterviewMutation } from '@/lib/hooks/llm/useStartInterviewMutation';
import { toast } from '@/lib/toast/store';
import { uploadFile } from '@/lib/upload/uploadFile';
import { toUIMessage } from '@/lib/utils/llm';
import { validateFiles } from '@/lib/validators/attachment';

import type { UIMessage } from '@/lib/utils/llm';
import type { InterviewType } from '@/types/llm';

type Props = {
  roomId: string;
  numericRoomId: number;
};

const MAX_QUESTIONS = 5;

type InterviewSession = {
  interviewId: number;
  type: InterviewType;
  questionCount: number;
};

type InterviewUIState = 'idle' | 'select' | 'starting' | 'active' | 'ending';

export default function LlmChatPage({ roomId: _roomId, numericRoomId }: Props) {
  const { setOptions, resetOptions } = useAppFrame();

  useEffect(() => {
    setOptions({ showBottomNav: false });
    return () => resetOptions();
  }, [resetOptions, setOptions]);

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useMessagesInfiniteQuery(numericRoomId);

  const sendMessageMutation = useSendMessageMutation(numericRoomId);
  const startInterviewMutation = useStartInterviewMutation(numericRoomId);
  const endInterviewMutation = useEndInterviewMutation(numericRoomId);

  const serverMessages = useMemo<UIMessage[]>(() => {
    if (!data?.pages) return [];

    const allMessages = data.pages.flatMap((page) => page?.messages ?? []);
    return allMessages.map(toUIMessage);
  }, [data]);

  const [localMessages, setLocalMessages] = useState<UIMessage[]>([]);

  const [attachedImages, setAttachedImages] = useState<File[]>([]);
  const [attachedPdf, setAttachedPdf] = useState<File | null>(null);

  const [interviewUIState, setInterviewUIState] = useState<InterviewUIState>('idle');
  const [interviewSession, setInterviewSession] = useState<InterviewSession | null>(null);

  const handleSendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      const hasFiles = attachedImages.length > 0 || attachedPdf !== null;

      if (!trimmed && !hasFiles) return;

      const tempId = `temp-${Date.now()}`;
      const filesToUpload = [...attachedImages, ...(attachedPdf ? [attachedPdf] : [])];

      setLocalMessages((prev) => [
        ...prev,
        {
          id: tempId,
          role: 'USER',
          text: trimmed || '(첨부 파일)',
          time: '전송 중...',
          status: 'sending',
        },
      ]);

      setAttachedImages([]);
      setAttachedPdf(null);

      try {
        const fileIds: number[] = [];
        for (const file of filesToUpload) {
          const result = await uploadFile({
            file,
            category: 'ATTACHMENT',
            refType: 'MESSAGE',
          });
          fileIds.push(result.fileId);
        }

        sendMessageMutation.mutate(
          { content: trimmed, fileIds: fileIds.length > 0 ? fileIds : undefined },
          {
            onSuccess: (response) => {
              if (!response) return;
              setLocalMessages((prev) => {
                const filtered = prev.filter((m) => m.id !== tempId);
                return [
                  ...filtered,
                  toUIMessage(response.userMessage),
                  toUIMessage(response.aiResponse),
                ];
              });

              if (interviewSession) {
                const newCount = interviewSession.questionCount + 1;
                if (newCount >= MAX_QUESTIONS) {
                  setInterviewSession((prev) =>
                    prev ? { ...prev, questionCount: newCount } : null,
                  );
                } else {
                  setInterviewSession((prev) =>
                    prev ? { ...prev, questionCount: newCount } : null,
                  );
                }
              }
            },
            onError: () => {
              setLocalMessages((prev) =>
                prev.map((m) =>
                  m.id === tempId ? { ...m, status: 'failed', time: '전송 실패' } : m,
                ),
              );
            },
          },
        );
      } catch {
        setLocalMessages((prev) =>
          prev.map((m) => (m.id === tempId ? { ...m, status: 'failed', time: '업로드 실패' } : m)),
        );
      }
    },
    [sendMessageMutation, attachedImages, attachedPdf, interviewSession],
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

  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [sheetOpen, setSheetOpen] = useState(false);

  const handlePickImages = useCallback(() => {
    imageInputRef.current?.click();
  }, []);

  const handlePickFile = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      if (files.length === 0) return;

      const result = validateFiles(
        files,
        CHAT_ATTACHMENT_CONSTRAINTS,
        attachedImages.length,
        attachedPdf ? 1 : 0,
      );

      if (result.errors.length > 0) {
        toast(result.errors[0].message);
      }

      if (result.okFiles.length > 0) {
        setAttachedImages((prev) => [...prev, ...result.okFiles]);
      }

      e.target.value = '';
    },
    [attachedImages.length, attachedPdf],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      if (files.length === 0) return;

      const result = validateFiles(
        files,
        CHAT_ATTACHMENT_CONSTRAINTS,
        attachedImages.length,
        attachedPdf ? 1 : 0,
      );

      if (result.errors.length > 0) {
        toast(result.errors[0].message);
      }

      const pdfFile = result.okFiles.find((f) => f.type === 'application/pdf');
      if (pdfFile) {
        setAttachedPdf(pdfFile);
      }

      e.target.value = '';
    },
    [attachedImages.length, attachedPdf],
  );

  const handleRemoveImage = useCallback((index: number) => {
    setAttachedImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleRemovePdf = useCallback(() => {
    setAttachedPdf(null);
  }, []);

  const handleStartInterview = useCallback(
    (type: InterviewType) => {
      setInterviewUIState('starting');

      startInterviewMutation.mutate(type, {
        onSuccess: (response) => {
          if (!response) return;

          setInterviewSession({
            interviewId: response.interviewId,
            type,
            questionCount: 1,
          });
          setInterviewUIState('active');

          setLocalMessages((prev) => [
            ...prev,
            {
              id: String(response.content.messageId),
              role: 'AI',
              text: response.content.content,
              time: new Date(response.content.createdAt).toLocaleTimeString('ko-KR', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              }),
            },
          ]);
        },
        onError: () => {
          toast('면접 모드 시작에 실패했습니다.');
          setInterviewUIState('idle');
        },
      });
    },
    [startInterviewMutation],
  );

  const handleEndInterview = useCallback(() => {
    if (!interviewSession) return;

    setInterviewUIState('ending');

    endInterviewMutation.mutate(interviewSession.interviewId, {
      onSuccess: (response) => {
        if (!response) return;

        setLocalMessages((prev) => [
          ...prev,
          {
            id: `sys-${Date.now()}`,
            role: 'SYSTEM',
            text: '면접이 종료되었습니다. 답변 평가를 시작합니다.',
          },
        ]);

        setInterviewSession(null);
        setInterviewUIState('idle');
        toast('면접 평가가 시작되었습니다.');
      },
      onError: () => {
        toast('면접 종료에 실패했습니다.');
        setInterviewUIState('active');
      },
    });
  }, [interviewSession, endInterviewMutation]);

  useEffect(() => {
    if (interviewSession && interviewSession.questionCount >= MAX_QUESTIONS) {
      const timer = setTimeout(() => {
        handleEndInterview();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [interviewSession, handleEndInterview]);

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
                onClick={() => handleStartInterview('PERSONAL')}
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
                {interviewSession.type === 'PERSONAL' ? '인성 면접' : '기술 면접'}
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

        <LlmComposer
          onAttach={() => setSheetOpen(true)}
          onSend={handleSendMessage}
          disabled={sendMessageMutation.isPending}
          attachedImages={attachedImages}
          attachedPdf={attachedPdf}
          onRemoveImage={handleRemoveImage}
          onRemovePdf={handleRemovePdf}
        />
      </div>

      <LlmAttachmentSheet
        open={sheetOpen}
        title="채팅 첨부"
        onClose={() => setSheetOpen(false)}
        onPickImages={handlePickImages}
        onPickFile={handlePickFile}
      />

      <input
        ref={imageInputRef}
        type="file"
        accept={IMAGE_MIME_TYPES.join(',')}
        multiple
        className="hidden"
        onChange={handleImageChange}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleFileChange}
      />
    </main>
  );
}
