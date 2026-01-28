import { Smile } from 'lucide-react';

export default function MyPageScreen() {
  return (
    <main className="flex flex-col px-6 py-4">
      <h1 className="text-xl font-bold">마이페이지</h1>

      <section className="mt-4 rounded-xl bg-neutral-100 p-4">
        <div className="h-20" />
      </section>

      <section className="flex flex-1 flex-col items-center justify-center py-24">
        <Smile className="h-12 w-12 text-neutral-300" />
        <p className="mt-4 text-sm text-neutral-400">다음 버전에 기능 추가 예정입니다.</p>
      </section>
    </main>
  );
}
