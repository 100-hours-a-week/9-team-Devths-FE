'use client';

import { Paperclip } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import LlmAttachmentSheet from '@/components/llm/analysis/LlmAttachmentSheet';
import LlmLoadingModal from '@/components/llm/analysis/LlmLoadingModal';
import LlmModelNotice from '@/components/llm/analysis/LlmModelNotice';
import LlmModelSwitch from '@/components/llm/analysis/LlmModelSwitch';
import LlmTextAreaCard from '@/components/llm/analysis/LlmTextAreaCard';
import { getAnalysisDisabledReason } from '@/lib/validators/analysisForm';

import type { AnalysisFormState, DocumentInput, LlmModel } from '@/types/llm';

type Target = 'RESUME' | 'JOB' | null;

type Props = {
  roomId: string;
};

const EMPTY_DOCUMENT: DocumentInput = {
  text: '',
  images: [],
  pdf: null,
};

export default function LlmAnalysisPage({ roomId }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<AnalysisFormState>({
    resume: { ...EMPTY_DOCUMENT },
    jobPosting: { ...EMPTY_DOCUMENT },
    model: 'GEMINI',
  });
  const [sheetOpen, setSheetOpen] = useState(false);
  const [target, setTarget] = useState<Target>(null);
  const [isLoading, setIsLoading] = useState(false);

  const disabledReason = getAnalysisDisabledReason(form.resume, form.jobPosting);
  const isSubmitDisabled = isLoading || disabledReason !== null;

  const updateResume = useCallback((updates: Partial<DocumentInput>) => {
    setForm((prev) => ({
      ...prev,
      resume: { ...prev.resume, ...updates },
    }));
  }, []);

  const updateJobPosting = useCallback((updates: Partial<DocumentInput>) => {
    setForm((prev) => ({
      ...prev,
      jobPosting: { ...prev.jobPosting, ...updates },
    }));
  }, []);

  const updateModel = useCallback((model: LlmModel) => {
    setForm((prev) => ({ ...prev, model }));
  }, []);

  useEffect(() => {
    if (!isLoading) return;

    const t = setTimeout(() => {
      setIsLoading(false);
      router.push(`/llm/${roomId}/result`);
    }, 1500);

    return () => clearTimeout(t);
  }, [isLoading, router, roomId]);

  return (
    <main className="flex min-h-[calc(100dvh-56px-64px)] flex-col bg-white px-4 pt-5 pb-4 text-black">
      <div className="space-y-4">
        <LlmTextAreaCard
          label="이력서 및 포트폴리오 입력"
          placeholder="이력서/포트폴리오 내용을 붙여 넣거나 직접 입력하세요."
          value={form.resume.text}
          onChange={(text) => updateResume({ text })}
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
          value={form.jobPosting.text}
          onChange={(text) => updateJobPosting({ text })}
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

        <LlmModelSwitch value={form.model} onChange={updateModel} />
        <LlmModelNotice model={form.model} />
      </div>

      <div className="mt-auto pt-6 pb-2">
        {disabledReason && (
          <p className="mb-2 text-center text-xs text-neutral-500">{disabledReason}</p>
        )}
        <button
          type="button"
          disabled={isSubmitDisabled}
          onClick={() => setIsLoading(true)}
          className={[
            'w-full rounded-2xl py-4 text-sm font-semibold transition',
            isSubmitDisabled
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
        onPickImages={() => {}}
        onPickFile={() => {}}
      />

      <LlmLoadingModal open={isLoading} onClose={() => setIsLoading(false)} />
    </main>
  );
}
