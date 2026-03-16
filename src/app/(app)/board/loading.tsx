export default function BoardLoading() {
  return (
    <main className="px-3 pt-4 pb-3">
      <div className="flex flex-col gap-3">
        <div className="h-9 w-full rounded-lg bg-neutral-100 animate-pulse" />
        <div className="h-8 w-24 rounded-full bg-neutral-100 animate-pulse" />
      </div>
      <div className="mt-4 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-2xl bg-white px-4 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)]"
          >
            <div className="flex gap-3">
              <div className="h-10 w-10 flex-shrink-0 rounded-full bg-neutral-200" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-3.5 w-20 rounded bg-neutral-200" />
                  <div className="h-3 w-12 rounded bg-neutral-100" />
                </div>
                <div className="h-3 w-24 rounded bg-neutral-100" />
                <div className="mt-2 h-4 w-3/4 rounded bg-neutral-200" />
                <div className="h-3.5 w-full rounded bg-neutral-100" />
                <div className="h-3.5 w-2/3 rounded bg-neutral-100" />
                <div className="mt-1 flex gap-1.5">
                  <div className="h-5 w-14 rounded-full bg-neutral-100" />
                  <div className="h-5 w-16 rounded-full bg-neutral-100" />
                </div>
                <div className="mt-1 flex gap-3">
                  <div className="h-3 w-10 rounded bg-neutral-100" />
                  <div className="h-3 w-10 rounded bg-neutral-100" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
