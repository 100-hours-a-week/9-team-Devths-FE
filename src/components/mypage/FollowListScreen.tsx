'use client';

import { Users } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export default function FollowListScreen() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') === 'followings' ? 'followings' : 'followers';

  return (
    <main className="flex flex-col px-6 py-4">
      <section className="mt-2 rounded-2xl bg-white p-4">
        <p className="text-xs font-semibold text-neutral-500">MEM-003</p>
        <h2 className="mt-1 text-lg font-bold text-neutral-900">마이페이지 - 팔로워/팔로잉 목록</h2>
        <p className="mt-2 text-sm text-neutral-600">
          현재 탭: {tab === 'followers' ? '팔로워' : '팔로잉'}
        </p>
      </section>

      <section className="mt-4 rounded-2xl bg-white p-4">
        <div className="h-10 rounded-xl bg-neutral-100" />

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
