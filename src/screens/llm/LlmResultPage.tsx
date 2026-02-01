'use client';

import { Loader2, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { getTaskStatus } from '@/lib/api/llmRooms';

import type { ApiResponse } from '@/types/api';
import type { TaskResultData } from '@/types/llm';

type AnalysisResult = {
  content?: string;
  metadata?: {
    score?: number;
    summary?: string;
    strengths?: string[];
  };
};

type Props = {
  roomId: string;
  numericRoomId: number;
  taskId: string | null;
  model: string | null;
};

export default function LlmResultPage({ roomId, numericRoomId, taskId, model }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState<TaskResultData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!taskId) {
      setIsLoading(false);
      setError('분석 결과를 찾을 수 없습니다.');
      return;
    }

    const fetchResult = async () => {
      try {
        const response = await getTaskStatus(Number(taskId));
        if (!response.ok || !response.json) {
          throw new Error('결과 조회에 실패했습니다.');
        }
        const json = response.json as ApiResponse<TaskResultData>;
        setResult(json.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResult();
  }, [taskId]);

  if (isLoading) {
    return (
      <main className="flex min-h-[calc(100dvh-56px-64px)] items-center justify-center bg-transparent">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-[calc(100dvh-56px-64px)] flex-col items-center justify-center bg-transparent px-4">
        <p className="text-sm text-neutral-600">{error}</p>
        <Link
          href="/llm"
          className="mt-4 rounded-xl bg-neutral-900 px-6 py-3 text-sm font-semibold text-white"
        >
          돌아가기
        </Link>
      </main>
    );
  }

  const analysisResult = result?.result as AnalysisResult | null;
  const content = analysisResult?.content ?? '';
  const metadata = analysisResult?.metadata;

  return (
    <main className="min-h-[calc(100dvh-56px-64px)] bg-transparent px-4 pt-6 pb-6 text-black">
      <section className="space-y-5">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-neutral-400 uppercase">
            Result
          </p>
          <h1 className="mt-2 text-2xl font-semibold">AI 분석 결과</h1>
          {metadata?.summary && <p className="mt-2 text-sm text-neutral-600">{metadata.summary}</p>}
        </div>

        {metadata?.score !== undefined && (
          <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-900 text-xl font-bold text-white">
              {metadata.score}
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-900">매칭 점수</p>
              <p className="text-xs text-neutral-500">이력서와 채용공고의 적합도</p>
            </div>
          </div>
        )}

        {metadata?.strengths && metadata.strengths.length > 0 && (
          <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-5">
            <p className="text-xs font-semibold text-neutral-500">강점</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {metadata.strengths.map((strength, idx) => (
                <span
                  key={idx}
                  className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800"
                >
                  {strength}
                </span>
              ))}
            </div>
          </div>
        )}

        {content && (
          <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-5">
            <p className="text-xs font-semibold text-neutral-500">상세 분석</p>
            <div className="mt-3 text-sm leading-6 whitespace-pre-wrap text-neutral-800">
              {content}
            </div>
          </div>
        )}

        <Link
          href={`/llm/${roomId}?rid=${numericRoomId}${model ? `&model=${model}` : ''}`}
          className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-black px-4 py-4 text-sm font-semibold text-white hover:bg-neutral-900"
        >
          대화 시작하기
          <MessageCircle className="h-5 w-5" />
        </Link>
      </section>
    </main>
  );
}
