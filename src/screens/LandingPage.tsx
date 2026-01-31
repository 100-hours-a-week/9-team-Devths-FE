import Image from 'next/image';

import GoogleLoginButton from '@/components/auth/GoogleLoginButton';
import LandingCarousel from '@/components/common/LandingCarousel';

export default function LandingPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-white px-6 py-10">
      <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-8">
        <header className="flex flex-col items-center gap-3 text-center">
          <h1 className="flex items-center">
            <span className="sr-only">Devths</span>
            <Image
              src="/icons/Devths.png"
              alt="Devths"
              width={220}
              height={56}
              className="h-12 w-auto"
              priority
            />
          </h1>
          <p className="text-sm font-medium text-black/45">
            일정과 협업을 더 간단하게, 필요한 순간엔 AI까지.
          </p>
        </header>

        <LandingCarousel />

        <section className="w-full">
          <GoogleLoginButton />
        </section>
      </div>
    </main>
  );
}
