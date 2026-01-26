'use client';

import { Paperclip } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useRef, useState } from 'react';

import LlmAttachmentSheet from '@/components/llm/analysis/LlmAttachmentSheet';
import LlmLoadingModal from '@/components/llm/analysis/LlmLoadingModal';
import LlmModelNotice from '@/components/llm/analysis/LlmModelNotice';
import LlmModelSwitch from '@/components/llm/analysis/LlmModelSwitch';
import LlmTextAreaCard from '@/components/llm/analysis/LlmTextAreaCard';
import {
  IMAGE_MIME_TYPES,
  FILE_MIME_TYPES,
  LLM_ATTACHMENT_CONSTRAINTS,
} from '@/constants/attachment';
import { startAnalysis } from '@/lib/api/llmRooms';
import { toast } from '@/lib/toast/store';
import { uploadFile } from '@/lib/upload/uploadFile';
import { getAnalysisDisabledReason } from '@/lib/validators/analysisForm';
import { validateFiles } from '@/lib/validators/attachment';

import type { ApiResponse } from '@/types/api';
import type {
  AnalysisFormState,
  DocumentInput,
  LlmModel,
  StartAnalysisResponse,
} from '@/types/llm';

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

  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const getCurrentDoc = useCallback(() => {
    return target === 'RESUME' ? form.resume : form.jobPosting;
  }, [target, form.resume, form.jobPosting]);

  const getUpdateFn = useCallback(() => {
    return target === 'RESUME' ? updateResume : updateJobPosting;
  }, [target, updateResume, updateJobPosting]);

  const handlePickImages = useCallback(() => {
    imageInputRef.current?.click();
  }, []);

  const handlePickFile = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;

      const doc = getCurrentDoc();
      const updateFn = getUpdateFn();

      const { okFiles, errors } = validateFiles(
        files,
        LLM_ATTACHMENT_CONSTRAINTS,
        doc.images.length,
        0,
      );

      if (errors.length > 0) {
        toast(errors[0].message);
      }

      if (okFiles.length > 0) {
        updateFn({ images: [...doc.images, ...okFiles] });
      }

      e.target.value = '';
    },
    [getCurrentDoc, getUpdateFn],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;

      const doc = getCurrentDoc();
      const updateFn = getUpdateFn();

      const { okFiles, errors } = validateFiles(
        files,
        LLM_ATTACHMENT_CONSTRAINTS,
        0,
        doc.pdf ? 1 : 0,
      );

      if (errors.length > 0) {
        toast(errors[0].message);
      }

      if (okFiles.length > 0) {
        updateFn({ pdf: okFiles[0] });
      }

      e.target.value = '';
    },
    [getCurrentDoc, getUpdateFn],
  );

  const handlePasteBlocked = useCallback(() => {
    toast('파일은 첨부 버튼을 이용해 주세요.');
  }, []);

  const handleSubmit = useCallback(async () => {
    setIsLoading(true);

    try {
      let resumeId: number | null = null;
      if (form.resume.pdf) {
        const result = await uploadFile({
          file: form.resume.pdf,
          category: 'RESUME',
          refType: 'CHATROOM',
          refId: Number(roomId),
        });
        resumeId = result.fileId;
      }

      let jobPostingId: number | null = null;
      if (form.jobPosting.pdf) {
        const result = await uploadFile({
          file: form.jobPosting.pdf,
          category: 'JOB_POSTING',
          refType: 'CHATROOM',
          refId: Number(roomId),
        });
        jobPostingId = result.fileId;
      }

      const analysisResult = await startAnalysis(Number(roomId), {
        resumeId,
        portfolioId: null,
        jobPostingId,
      });

      if (!analysisResult.ok || !analysisResult.json) {
        throw new Error('분석 요청에 실패했습니다.');
      }

      const analysisJson = analysisResult.json as ApiResponse<StartAnalysisResponse>;
      const { taskId } = analysisJson.data;

      router.push(`/llm/${roomId}/result?taskId=${taskId}`);
    } catch (error) {
      setIsLoading(false);
      toast(error instanceof Error ? error.message : '분석 요청 중 오류가 발생했습니다.');
    }
  }, [form.resume.pdf, form.jobPosting.pdf, roomId, router]);

  return (
    <main className="flex min-h-[calc(100dvh-56px-64px)] flex-col bg-white px-4 pt-5 pb-4 text-black">
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
        accept={FILE_MIME_TYPES.join(',')}
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="space-y-4">
        <LlmTextAreaCard
          label="이력서 및 포트폴리오 입력"
          placeholder="이력서/포트폴리오 내용을 붙여 넣거나 직접 입력하세요."
          value={form.resume.text}
          onChange={(text) => updateResume({ text })}
          onPasteBlocked={handlePasteBlocked}
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
          onPasteBlocked={handlePasteBlocked}
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
          onClick={handleSubmit}
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
        onPickImages={handlePickImages}
        onPickFile={handlePickFile}
      />

      <LlmLoadingModal open={isLoading} onClose={() => setIsLoading(false)} />
    </main>
  );
}
