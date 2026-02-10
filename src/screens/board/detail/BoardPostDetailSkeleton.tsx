import { MessageCircle, Share2, ThumbsUp } from 'lucide-react';

export default function BoardPostDetailSkeleton() {
  return (
    <>
      <main
        className="px-3 pt-4 pb-6"
        style={{ paddingBottom: 'calc(var(--bottom-nav-h) + 88px)' }}
      >
        <div className="space-y-3">
          <div className="rounded-2xl bg-white px-4 py-4 shadow-[0_6px_18px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-full bg-neutral-100" />
              <div className="space-y-1">
                <div className="h-3 w-16 rounded-full bg-neutral-100" />
                <div className="h-2 w-20 rounded-full bg-neutral-100" />
              </div>
            </div>
            <div className="h-6 w-6 rounded-full bg-neutral-100" />
          </div>

          <div className="mt-4 space-y-2">
            <div className="h-4 w-2/3 rounded-full bg-neutral-100" />
            <div className="h-3 w-full rounded-full bg-neutral-100" />
            <div className="h-3 w-5/6 rounded-full bg-neutral-100" />
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <div className="h-6 w-16 rounded-full bg-neutral-100" />
            <div className="h-6 w-12 rounded-full bg-neutral-100" />
            <div className="h-6 w-14 rounded-full bg-neutral-100" />
          </div>

          <div className="mt-4 flex items-center gap-4 text-xs text-neutral-400">
            <div className="inline-flex items-center gap-1">
              <ThumbsUp className="h-4 w-4" />
              <span className="h-3 w-6 rounded-full bg-neutral-100" />
            </div>
            <div className="inline-flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              <span className="h-3 w-6 rounded-full bg-neutral-100" />
            </div>
            <div className="inline-flex items-center gap-1">
              <Share2 className="h-4 w-4" />
              <span className="h-3 w-6 rounded-full bg-neutral-100" />
            </div>
          </div>
        </div>

          <div className="space-y-2">
            <div className="h-3 w-20 rounded-full bg-neutral-100" />
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={`comment-skeleton-${index}`}
                  className="rounded-2xl border border-neutral-100 bg-white px-3 py-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-neutral-100" />
                      <div className="space-y-1">
                        <div className="h-3 w-14 rounded-full bg-neutral-100" />
                        <div className="h-2 w-10 rounded-full bg-neutral-100" />
                      </div>
                    </div>
                    <div className="h-5 w-5 rounded-full bg-neutral-100" />
                  </div>
                  <div className="mt-2 h-3 w-4/5 rounded-full bg-neutral-100" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <div className="fixed bottom-[calc(var(--bottom-nav-h)+12px)] left-1/2 z-40 w-full max-w-[430px] -translate-x-1/2 px-4 sm:px-6">
        <div className="rounded-xl bg-[#F1F5F9] px-3 py-2 text-xs text-neutral-500 shadow-[0_8px_20px_rgba(15,23,42,0.08)]">
          개인정보(연락처, 계좌번호 등) 공유에 주의하세요
        </div>
      </div>
    </>
  );
}
