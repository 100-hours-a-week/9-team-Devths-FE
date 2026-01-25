'use client';

import { Paperclip } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import LlmAttachmentSheet from '@/components/llm/analysis/LlmAttachmentSheet';
import LlmLoadingModal from '@/components/llm/analysis/LlmLoadingModal';
import LlmModelNotice from '@/components/llm/analysis/LlmModelNotice';
import LlmModelSwitch, { type LlmModel } from '@/components/llm/analysis/LlmModelSwitch';
import LlmTextAreaCard from '@/components/llm/analysis/LlmTextAreaCard';

type Target = 'RESUME' | 'JOB' | null;

export default function LlmAnalysisPage() {
  const router = useRouter();
  const [resumeText, setResumeText] = useState('');
  const [jobText, setJobText] = useState('');
  const [model, setModel] = useState<LlmModel>('GEMINI');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [target, setTarget] = useState<Target>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isLoading) return;

    const t = setTimeout(() => {
      setIsLoading(false);
      router.push('/llm/result');
    }, 1500);

    return () => clearTimeout(t);
  }, [isLoading, router]);

  return (
    <main className="flex min-h-[calc(100dvh-56px-64px)] flex-col bg-white px-4 pt-5 pb-4 text-black">
      <div className="space-y-4">
        <LlmTextAreaCard
          label="이력서 및 포트폴리오 입력"
          placeholder="이력서/포트폴리오 내용을 붙여 넣거나 직접 입력하세요."
          value={resumeText}
          onChange={setResumeText}
          headerRight={
            <button
              type="button"
              onClick={() => {
                setTarget('RESUME');
                setSheetOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-800 hover:bg-neutral-50"
            >
              <Paperclip className="h-4 w-4" />
              첨부
            </button>
          }
        />

        <LlmTextAreaCard
          label="채용 공고 입력"
          placeholder="채용 공고 내용을 붙여 넣거나 직접 입력하세요."
          value={jobText}
          onChange={setJobText}
          headerRight={
            <button
              type="button"
              onClick={() => {
                setTarget('JOB');
                setSheetOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-800 hover:bg-neutral-50"
            >
              <Paperclip className="h-4 w-4" />
              첨부
            </button>
          }
        />

        <LlmModelSwitch value={model} onChange={setModel} />
        <LlmModelNotice model={model} />
      </div>

      <div className="mt-auto pt-6 pb-2">
        <button
          type="button"
          disabled={isLoading}
          onClick={() => setIsLoading(true)}
          className={[
            'w-full rounded-2xl py-4 text-sm font-semibold transition',
            isLoading
              ? 'cursor-not-allowed bg-neutral-200 text-neutral-500'
              : 'bg-neutral-900 text-white hover:bg-neutral-800',
          ].join(' ')}
        >
          종합 분석하기
        </button>
      </div>

      <LlmAttachmentSheet
        open={sheetOpen}
        title={target === 'RESUME' ? '이력서/포트폴리오 첨부' : '채용 공고 첨부'}
        onClose={() => setSheetOpen(false)}
        onPickImages={() => {
          // TODO: Commit 9에서 input[file] 연결
        }}
        onPickFile={() => {
          // TODO: Commit 9에서 input[file] 연결
        }}
      />

      <LlmLoadingModal open={isLoading} onClose={() => setIsLoading(false)} />
    </main>
  );
}
