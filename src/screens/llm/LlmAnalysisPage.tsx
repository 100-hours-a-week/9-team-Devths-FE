'use client';

import { useState } from 'react';

import LlmTextAreaCard from '@/components/llm/analysis/LlmTextAreaCard';

export default function LlmAnalysisPage() {
  const [resumeText, setResumeText] = useState('');
  const [jobText, setJobText] = useState('');

  return (
    <main className="px-2 pt-4 pb-2">
      <div className="space-y-4">
        <LlmTextAreaCard
          label="이력서 및 포트폴리오 입력"
          placeholder="이력서/포트폴리오 내용을 붙여 넣거나 직접 입력하세요."
          value={resumeText}
          onChange={setResumeText}
        />

        <LlmTextAreaCard
          label="채용 공고 입력"
          placeholder="채용 공고 내용을 붙여 넣거나 직접 입력하세요."
          value={jobText}
          onChange={setJobText}
        />
      </div>
    </main>
  );
}
