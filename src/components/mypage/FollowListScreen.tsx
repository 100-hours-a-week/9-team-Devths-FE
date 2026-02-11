'use client';

import { Users } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export default function FollowListScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') === 'followings' ? 'followings' : 'followers';

  const handleChangeTab = (tab: 'followers' | 'followings') => {
    if (tab === activeTab) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);

    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <main className="flex flex-col px-6 py-4">
      <section className="mt-2 rounded-2xl bg-white p-4">
        <p className="text-xs font-semibold text-neutral-500">MEM-003</p>
        <h2 className="mt-1 text-lg font-bold text-neutral-900">마이페이지 - 팔로워/팔로잉 목록</h2>
        <p className="mt-2 text-sm text-neutral-600">
          현재 탭: {activeTab === 'followers' ? '팔로워' : '팔로잉'}
        </p>
      </section>

      <section className="mt-4 rounded-2xl bg-white p-4">
        <div className="flex border-b border-neutral-200">
          <button
            type="button"
            onClick={() => handleChangeTab('followers')}
            className={`flex-1 border-b-2 py-2 text-sm font-semibold transition-colors ${
              activeTab === 'followers'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
          >
            팔로워
          </button>
          <button
            type="button"
            onClick={() => handleChangeTab('followings')}
            className={`flex-1 border-b-2 py-2 text-sm font-semibold transition-colors ${
              activeTab === 'followings'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
          >
            팔로잉
          </button>
        </div>

        <div className="mt-4 flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed border-neutral-200 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
            <Users className="h-6 w-6 text-neutral-400" />
          </div>
          <p className="mt-4 text-sm font-semibold text-neutral-700">팔로워/팔로잉 목록 준비 중</p>
          <p className="mt-1 text-xs text-neutral-400">다음 커밋에서 목록/모달 기능이 추가됩니다.</p>
        </div>
      </section>
    </main>
  );
}
