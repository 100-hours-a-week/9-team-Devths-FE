'use client';

import Image from 'next/image';

import { formatRelativeTime } from '@/lib/utils/board';

import type { CommentAuthor } from '@/types/boardDetail';

type ReplyItemProps = {
  author: CommentAuthor;
  createdAt: string;
  content: string | null;
  isDeleted?: boolean;
};

export default function ReplyItem({ author, createdAt, content, isDeleted }: ReplyItemProps) {
  return (
    <div className="ml-6 rounded-2xl border border-neutral-200 bg-white px-3 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative flex h-6 w-6 items-center justify-center rounded-full border border-neutral-200 bg-neutral-200 text-[10px] font-semibold text-neutral-600">
            {author.profileImageUrl ? (
              <Image
                src={author.profileImageUrl}
                alt={`${author.nickname} 프로필 이미지`}
                fill
                sizes="24px"
                className="rounded-full object-cover"
              />
            ) : (
              <span>{author.nickname.slice(0, 1)}</span>
            )}
          </div>
          <div>
            <div className="text-[11px] font-semibold text-neutral-800">{author.nickname}</div>
            <div className="text-[10px] text-neutral-400">{formatRelativeTime(createdAt)}</div>
          </div>
        </div>
      </div>
      <p className="mt-2 text-xs text-neutral-600">{isDeleted ? '삭제된 댓글입니다.' : content}</p>
    </div>
  );
}
