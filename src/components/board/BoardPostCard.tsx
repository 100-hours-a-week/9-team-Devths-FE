'use client';

import { Heart, MessageCircle, Share2 } from 'lucide-react';

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
      className="border-b border-neutral-200 bg-white px-4 py-4 transition hover:bg-neutral-50"
    >
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleAuthorClick}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-200 text-sm font-semibold text-neutral-600"
          aria-label={`${post.author.nickname} 프로필 보기`}
        >
          {post.author.nickname.slice(0, 1)}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAuthorClick}
              className="text-sm font-semibold text-neutral-900"
            >
              {post.author.nickname}
            </button>
            <span className="text-xs text-neutral-400">
              {formatRelativeTime(post.createdAt)}
            </span>
          </div>

          {post.author.interests && post.author.interests.length > 0 ? (
            <div className="mt-1 flex flex-wrap gap-1 text-[11px] text-neutral-500">
              {post.author.interests.map((interest) => (
                <span key={interest}>#{interest}</span>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-3">
        <h3 className="line-clamp-1 text-sm font-semibold text-neutral-900">{post.title}</h3>
        <p className="mt-1 line-clamp-2 text-xs text-neutral-500">{post.preview}</p>
      </div>

      {post.tags.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-neutral-600">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md border border-neutral-200 bg-neutral-100 px-2 py-0.5 font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-3 flex items-center gap-4 text-[11px] text-neutral-500">
        <div className="flex items-center gap-1">
          <Heart className="h-3.5 w-3.5" />
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
      </div>
    </article>
  );
}
