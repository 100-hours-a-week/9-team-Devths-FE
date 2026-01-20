import LandingCarousel from '@/components/common/LandingCarousel';

export default function LandingPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6">
      <h1 className="text-3xl font-bold">Devths</h1>

      {/* 캐러셀 자리 */}
      <LandingCarousel />

      {/* 시작하기(구글 OAuth) 버튼 자리 */}
      <button className="w-full max-w-sm rounded-xl border px-4 py-3 font-medium">
        Sign in with Google
      </button>
    </main>
  );
}
