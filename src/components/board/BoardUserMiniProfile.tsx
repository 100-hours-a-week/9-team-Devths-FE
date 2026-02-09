'use client';

import { MessageCircle, UserPlus } from 'lucide-react';
import Image from 'next/image';

import BaseModal from '@/components/common/BaseModal';
import type { BoardTag } from '@/types/board';

type BoardMiniProfileUser = {
  userId: number;
  nickname: string;
  profileImageUrl?: string | null;
  interests?: BoardTag[];
};

type BoardUserMiniProfileProps = {
  open: boolean;
  onClose: () => void;
  user: BoardMiniProfileUser | null;
  isFollowing?: boolean;
  onToggleFollow?: () => void;
  onStartChat?: () => void;
};

export default function BoardUserMiniProfile({
  open,
  onClose,
  user,
  isFollowing = false,
  onToggleFollow,
  onStartChat,
}: BoardUserMiniProfileProps) {
  if (!user) return null;

  return (
    <BaseModal open={open} onClose={onClose} contentClassName="pt-8">
      <div className="flex flex-col items-center gap-3">
        {user.profileImageUrl ? (
          <Image
            src={user.profileImageUrl}
            alt="프로필"
            width={72}
            height={72}
            className="h-18 w-18 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-18 w-18 items-center justify-center rounded-full bg-neutral-200 text-lg font-semibold text-neutral-600">
            {user.nickname.slice(0, 1)}
          </div>
        )}

        <div className="text-center">
          <p className="text-base font-semibold text-neutral-900">{user.nickname}</p>
          {user.interests && user.interests.length > 0 ? (
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              {user.interests.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-neutral-100 px-3 py-1 text-[11px] font-semibold text-neutral-700"
                >
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="mt-4 flex w-full gap-2">
          <button
            type="button"
            onClick={onStartChat}
            className="flex flex-1 items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
          >
            <MessageCircle className="h-4 w-4" />
            채팅
          </button>
          <button
            type="button"
            onClick={onToggleFollow}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#05C075] px-4 py-2 text-sm font-semibold text-white hover:bg-[#04A865]"
          >
            <UserPlus className="h-4 w-4" />
            {isFollowing ? '팔로잉' : '팔로우'}
          </button>
        </div>
      </div>
    </BaseModal>
  );
}
