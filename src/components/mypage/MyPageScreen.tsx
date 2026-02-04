'use client';

import { useQueryClient } from '@tanstack/react-query';
import { Pencil, Smile, User } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import ConfirmModal from '@/components/common/ConfirmModal';
import EditProfileModal from '@/components/mypage/EditProfileModal';
import WithdrawModal from '@/components/mypage/WithdrawModal';
import { postLogout } from '@/lib/api/auth';
import { clearAccessToken } from '@/lib/auth/token';
import { useMeQuery } from '@/lib/hooks/users/useMeQuery';
import { toast } from '@/lib/toast/store';

export default function MyPageScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useMeQuery();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleWithdraw = () => {
    setIsEditOpen(false);
    setIsWithdrawOpen(true);
  };

  const handleLogoutOpen = () => {
    setIsEditOpen(false);
    setIsLogoutConfirmOpen(true);
  };

  const handleLogoutCancel = () => {
    if (isLoggingOut) return;
    setIsLogoutConfirmOpen(false);
  };

  const handleLogoutConfirm = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    try {
      const result = await postLogout();
      if (!result.ok) {
        throw new Error('로그아웃에 실패했습니다.');
      }
      clearAccessToken();
      queryClient.clear();
      router.replace('/');
    } catch {
      toast('로그아웃에 실패했습니다.');
      setIsLoggingOut(false);
    }
  };

  return (
    <main className="flex flex-col px-6 py-4">
      <section className="-mx-6 mt-2 bg-white px-6 py-4">
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
          <div className="space-y-4">
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
                <p className="text-lg font-semibold text-neutral-900">{data?.nickname}</p>
                {data?.interests && data.interests.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {data.interests.map((tag) => {
                      const normalized = tag.toLowerCase();
                      const mappedTag =
                        normalized === '프론트엔드' ||
                        normalized === 'frontend' ||
                        normalized === 'fe'
                          ? 'FE'
                          : normalized === '백엔드' ||
                              normalized === 'backend' ||
                              normalized === 'be'
                            ? 'BE'
                            : normalized === '클라우드' || normalized === 'cloud'
                              ? 'CLOUD'
                              : normalized === 'ai' || normalized === '인공지능'
                                ? 'AI'
                                : tag;

                      return (
                        <span
                          key={tag}
                          className="justify-self-start rounded-full bg-neutral-100 px-3 py-1 text-center text-[11px] font-semibold whitespace-nowrap text-neutral-700"
                        >
                          #{mappedTag}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex flex-col items-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(true)}
                  className="flex items-center gap-1 rounded-full bg-[#05C075] px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-[#04A865]"
                >
                  <Pencil className="h-4 w-4" />
                  수정
                </button>
                <button
                  type="button"
                  onClick={handleLogoutOpen}
                  className="rounded-full border border-[#05C075] bg-white px-3 py-1.5 text-xs font-semibold text-[#05C075] shadow-sm hover:bg-[#E9F9F1]"
                >
                  로그아웃
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="mt-6 flex flex-1 flex-col items-center justify-center rounded-2xl bg-white py-20 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
          <Smile className="h-6 w-6 text-neutral-400" />
        </div>
        <p className="mt-4 text-sm font-semibold text-neutral-700">기능 업데이트 준비 중</p>
        <p className="mt-1 text-xs text-neutral-400">다음 버전에 추가될 예정입니다.</p>
      </section>

      <EditProfileModal
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onWithdraw={handleWithdraw}
        initialData={data}
      />

      <ConfirmModal
        isOpen={isLogoutConfirmOpen}
        title="로그아웃"
        message="로그아웃 하시겠습니까?"
        confirmText="확인"
        cancelText="취소"
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
      />

      <WithdrawModal
        open={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        nickname={data?.nickname ?? ''}
      />
    </main>
  );
}
