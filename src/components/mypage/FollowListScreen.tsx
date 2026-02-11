'use client';

import { Users } from 'lucide-react';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { useMyFollowersInfiniteQuery } from '@/lib/hooks/users/useMyFollowersInfiniteQuery';

export default function FollowListScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const {
    data: followerData,
    isLoading: isFollowersLoading,
    isError: isFollowersError,
    hasNextPage: hasFollowersNextPage,
    isFetchingNextPage: isFollowersFetchingNextPage,
    fetchNextPage: fetchFollowersNextPage,
  } = useMyFollowersInfiniteQuery({ size: 12 });
  const infiniteScrollTriggerRef = useRef<HTMLDivElement | null>(null);
  const activeTab = searchParams.get('tab') === 'followings' ? 'followings' : 'followers';
  const followers = followerData?.pages.flatMap((page) => page.followers) ?? [];

  const handleChangeTab = (tab: 'followers' | 'followings') => {
    if (tab === activeTab) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);

    router.replace(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    if (activeTab !== 'followers') return;

    const target = infiniteScrollTriggerRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        if (!hasFollowersNextPage || isFollowersFetchingNextPage) return;
        void fetchFollowersNextPage();
      },
      { rootMargin: '120px 0px' },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [activeTab, hasFollowersNextPage, isFollowersFetchingNextPage, fetchFollowersNextPage]);

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

        {activeTab === 'followers' ? (
          <div className="mt-4 space-y-2">
            {isFollowersLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3"
                >
                  <div className="h-10 w-10 animate-pulse rounded-full bg-neutral-200" />
                  <div className="h-4 w-24 animate-pulse rounded bg-neutral-200" />
                </div>
              ))
            ) : isFollowersError ? (
              <p className="py-8 text-center text-sm text-red-500">팔로워 목록을 불러오지 못했습니다.</p>
            ) : followers.length === 0 ? (
              <p className="py-8 text-center text-sm text-neutral-500">아직 팔로워가 없습니다.</p>
            ) : (
              <>
                {followers.map((follower) => (
                  <article
                    key={follower.id}
                    className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3"
                  >
                    {follower.profileImage ? (
                      <Image
                        src={follower.profileImage}
                        alt={`${follower.nickname} 프로필`}
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-200 text-sm font-semibold text-neutral-600">
                        {follower.nickname.slice(0, 1)}
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-neutral-900">{follower.nickname}</p>
                    </div>
                  </article>
                ))}
                {hasFollowersNextPage ? <div ref={infiniteScrollTriggerRef} className="h-1" /> : null}
                {isFollowersFetchingNextPage ? (
                  <p className="py-2 text-center text-xs text-neutral-400">팔로워를 불러오는 중...</p>
                ) : null}
              </>
            )}
          </div>
        ) : (
          <div className="mt-4 flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed border-neutral-200 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
              <Users className="h-6 w-6 text-neutral-400" />
            </div>
            <p className="mt-4 text-sm font-semibold text-neutral-700">팔로잉 목록 준비 중</p>
            <p className="mt-1 text-xs text-neutral-400">다음 커밋에서 목록 기능이 추가됩니다.</p>
          </div>
        )}
      </section>
    </main>
  );
}
