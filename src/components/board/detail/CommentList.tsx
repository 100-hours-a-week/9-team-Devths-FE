'use client';

import CommentItem from '@/components/board/detail/CommentItem';
import ReplyItem from '@/components/board/detail/ReplyItem';

import type { CommentThread } from '@/types/boardDetail';

type CommentListProps = {
  threads: CommentThread[];
  onReplyClick?: (commentId: number) => void;
};

export default function CommentList({ threads, onReplyClick }: CommentListProps) {
  if (threads.length === 0) {
    return (
      <p className="rounded-2xl bg-white px-4 py-6 text-center text-sm text-neutral-500">
        아직 댓글이 없어요.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {threads.map((thread) => (
        <div key={thread.comment.commentId} className="space-y-2">
          <CommentItem
            author={thread.comment.author}
            createdAt={thread.comment.createdAt}
            content={thread.comment.content}
            isDeleted={thread.comment.isDeleted}
            showReply
            onReplyClick={onReplyClick ? () => onReplyClick(thread.comment.commentId) : undefined}
          />
          {thread.replies.map((reply) => (
            <ReplyItem
              key={reply.commentId}
              author={reply.author}
              createdAt={reply.createdAt}
              content={reply.content}
              isDeleted={reply.isDeleted}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
