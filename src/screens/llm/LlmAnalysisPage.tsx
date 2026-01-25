'use client';

import { Paperclip } from 'lucide-react';
import { useState } from 'react';

import LlmAttachmentSheet from '@/components/llm/analysis/LlmAttachmentSheet';
import LlmModelNotice from '@/components/llm/analysis/LlmModelNotice';
import LlmModelSwitch, { type LlmModel } from '@/components/llm/analysis/LlmModelSwitch';
import LlmTextAreaCard from '@/components/llm/analysis/LlmTextAreaCard';

type Target = 'RESUME' | 'JOB' | null;

export default function LlmAnalysisPage() {
  const [resumeText, setResumeText] = useState('');
  const [jobText, setJobText] = useState('');
  const [model, setModel] = useState<LlmModel>('GEMINI');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [target, setTarget] = useState<Target>(null);

  return (
    <main className="px-2 pt-4 pb-2">
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
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
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
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
            >
              <Paperclip className="h-4 w-4" />
              첨부
            </button>
          }
        />

        <LlmModelSwitch value={model} onChange={setModel} />
        <LlmModelNotice model={model} />
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
    </main>
  );
}
