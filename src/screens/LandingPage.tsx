import GoogleLoginButton from '@/components/auths/GoogleLoginButton';
import LandingCarousel from '@/components/common/LandingCarousel';

export default function LandingPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6">
      <h1 className="text-3xl font-bold">Devths</h1>

      <LandingCarousel />

      <section className="w-full max-w-sm">
        <GoogleLoginButton />
      </section>
    </main>
  );
}
