'use client';

import type { BoardTag } from '@/types/board';

type PostContentProps = {
  title: string;
  content: string;
  tags?: BoardTag[];
};

export default function PostContent({ title, content, tags = [] }: PostContentProps) {
  return (
    <div className="mt-3">
      <h1 className="text-base font-semibold text-neutral-900">{title}</h1>
      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-neutral-700">
        {content}
      </p>

      {tags.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-[#1FAE73]">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md border border-[#BFEFDB] bg-[#E9F9F1] px-2 py-0.5 font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
