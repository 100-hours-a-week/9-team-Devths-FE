import type { DocumentInput } from '@/types/llm';

function hasContent(doc: DocumentInput): boolean {
  return (
    doc.text.trim().length > 0 || doc.images.length > 0 || doc.pdf !== null
  );
}

export function getAnalysisDisabledReason(
  resume: DocumentInput,
  jobPosting: DocumentInput
): string | null {
  const hasResume = hasContent(resume);
  const hasJobPosting = hasContent(jobPosting);

  if (!hasResume && !hasJobPosting) {
    return '이력서 또는 채용 공고를 입력해 주세요.';
  }

  return null;
}
