import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm rounded-3xl border border-black/10 bg-white/90 p-6 text-center shadow-sm backdrop-blur">
        <p className="text-[11px] font-semibold tracking-[0.2em] text-neutral-400 uppercase">
          404 NOT FOUND
        </p>
        <p className="mt-1 text-xs font-semibold text-[#05C075]">404</p>
        <h1 className="mt-2 text-xl font-semibold text-neutral-900">주소가 잘못되었어요</h1>
        <p className="mt-2 text-sm text-neutral-500">요청하신 페이지를 찾을 수 없어요.</p>
        <Link
          href="/"
          className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-2xl bg-[#05C075] text-sm font-semibold text-white transition hover:bg-[#049e61]"
        >
          홈으로 가기
        </Link>
      </div>
    </main>
  );
}
