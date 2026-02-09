'use client';

import clsx from 'clsx';
import { MessageCircle, Share2, ThumbsUp } from 'lucide-react';

import { formatCountCompact, formatRelativeTime } from '@/lib/utils/board';

import type { BoardPostSummary } from '@/types/board';

type BoardPostCardProps = {
  post: BoardPostSummary;
  onClick?: (postId: number) => void;
  onAuthorClick?: (userId: number) => void;
};

export default function BoardPostCard({ post, onClick, onAuthorClick }: BoardPostCardProps) {
  const handleCardClick = () => {
    onClick?.(post.postId);
  };

  const handleAuthorClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onAuthorClick?.(post.author.userId);
  };

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          handleCardClick();
        }
      }}
      className="space-y-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleAuthorClick}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-200 text-xs font-semibold text-neutral-600"
          aria-label={`${post.author.nickname} 프로필 보기`}
        >
          {post.author.nickname.slice(0, 1)}
        </button>
        <div className="flex-1">
          <button
            type="button"
            onClick={handleAuthorClick}
            className="text-sm font-semibold text-neutral-900"
          >
            {post.author.nickname}
          </button>
          <p className="text-xs text-neutral-400">{formatRelativeTime(post.createdAt)}</p>
        </div>
      </div>

      <div>
        <h3 className="line-clamp-1 text-sm font-semibold text-neutral-900">{post.title}</h3>
        <p className="mt-1 line-clamp-2 text-xs text-neutral-500">{post.preview}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {post.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-neutral-100 px-2 py-1 text-[11px] font-semibold text-neutral-700"
          >
            #{tag}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-4 text-[11px] text-neutral-500">
        <div className="flex items-center gap-1">
          <ThumbsUp className="h-3.5 w-3.5" />
          <span>{formatCountCompact(post.stats.likeCount)}</span>
        </div>
        <div className="flex items-center gap-1">
          <MessageCircle className="h-3.5 w-3.5" />
          <span>{formatCountCompact(post.stats.commentCount)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Share2 className="h-3.5 w-3.5" />
          <span>{formatCountCompact(post.stats.shareCount)}</span>
        </div>
        <span
          className={clsx(
            'ml-auto text-[10px] text-neutral-400',
            post.stats.likeCount >= 1000 ? 'font-semibold text-neutral-500' : '',
          )}
        >
          {formatRelativeTime(post.createdAt)}
        </span>
      </div>
    </article>
  );
}
