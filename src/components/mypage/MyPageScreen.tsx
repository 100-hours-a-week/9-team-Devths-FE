'use client';

import { Pencil, Smile, User } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

import EditProfileModal from '@/components/mypage/EditProfileModal';
import { useMeQuery } from '@/lib/hooks/users/useMeQuery';

export default function MyPageScreen() {
  const { data, isLoading, isError } = useMeQuery();
  const [isEditOpen, setIsEditOpen] = useState(false);

  return (
    <main className="flex flex-col px-6 py-4">
      <h1 className="text-xl font-bold">마이페이지</h1>

      <section className="mt-4 rounded-xl bg-white p-4 shadow-sm">
        {isLoading ? (
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 animate-pulse rounded-full bg-neutral-200" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-24 animate-pulse rounded bg-neutral-200" />
              <div className="h-4 w-32 animate-pulse rounded bg-neutral-200" />
            </div>
          </div>
        ) : isError ? (
          <p className="text-sm text-red-500">프로필을 불러오지 못했습니다.</p>
        ) : (
          <div className="flex items-center gap-4">
            {data?.profileImage?.url ? (
              <Image
                src={data.profileImage.url}
                alt="프로필"
                width={64}
                height={64}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-200">
                <User className="h-8 w-8 text-neutral-400" />
              </div>
            )}

            <div className="flex-1">
              <p className="text-lg font-semibold">{data?.nickname}</p>
              {data?.interests && data.interests.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {data.interests.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsEditOpen(true)}
              className="flex items-center gap-1 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-50"
            >
              <Pencil className="h-4 w-4" />
              수정
            </button>
          </div>
        )}
      </section>

      <section className="flex flex-1 flex-col items-center justify-center py-24">
        <Smile className="h-12 w-12 text-neutral-300" />
        <p className="mt-4 text-sm text-neutral-400">다음 버전에 기능 추가 예정입니다.</p>
      </section>

      <EditProfileModal
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        initialData={data}
      />
    </main>
  );
}
