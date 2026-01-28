import { Pencil, Smile, User } from 'lucide-react';

const DUMMY_PROFILE = {
  nickname: '카테부',
  interests: ['백엔드'],
};

export default function MyPageScreen() {
  return (
    <main className="flex flex-col px-6 py-4">
      <h1 className="text-xl font-bold">마이페이지</h1>

      <section className="mt-4 rounded-xl bg-white p-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-200">
            <User className="h-8 w-8 text-neutral-400" />
          </div>

          <div className="flex-1">
            <p className="text-lg font-semibold">{DUMMY_PROFILE.nickname}</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {DUMMY_PROFILE.interests.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="flex items-center gap-1 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-50"
          >
            <Pencil className="h-4 w-4" />
            수정
          </button>
        </div>
      </section>

      <section className="flex flex-1 flex-col items-center justify-center py-24">
        <Smile className="h-12 w-12 text-neutral-300" />
        <p className="mt-4 text-sm text-neutral-400">다음 버전에 기능 추가 예정입니다.</p>
      </section>
    </main>
  );
}
