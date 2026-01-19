export default function LandingPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6">
      <h1 className="text-3xl font-bold">Devths</h1>

      {/* 캐러셀 자리 */}
      <section className="bg-muted w-full max-w-sm rounded-2xl p-6 text-center">
        <p className="text-muted-foreground text-sm">서비스 소개 캐러셀 영역(추후 구현)</p>
      </section>

      {/* 시작하기(구글 OAuth) 버튼 자리 */}
      <button className="w-full max-w-sm rounded-xl border px-4 py-3 font-medium">
        Sign in with Google
      </button>
    </main>
  );
}
