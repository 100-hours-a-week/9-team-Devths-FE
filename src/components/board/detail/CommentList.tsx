'use client';

import CommentItem from '@/components/board/detail/CommentItem';
import ReplyItem from '@/components/board/detail/ReplyItem';

import type { CommentThread } from '@/types/boardDetail';
import type { ReactNode } from 'react';

type CommentListProps = {
  threads: CommentThread[];
  onReplyClick?: (commentId: number) => void;
  currentUserId?: number | null;
  onDeleteClick?: (commentId: number) => void;
  onEditClick?: (commentId: number, content: string | null) => void;
  isEditingCommentId?: number | null;
  renderEditor?: (commentId: number, content: string | null, depth: 1 | 2) => ReactNode;
  disableActions?: boolean;
  replyTargetId?: number | null;
  renderReplyEditor?: (commentId: number) => ReactNode;
};

export default function CommentList({
  threads,
  onReplyClick,
  currentUserId,
  onDeleteClick,
  onEditClick,
  isEditingCommentId,
  renderEditor,
  disableActions = false,
  replyTargetId,
  renderReplyEditor,
}: CommentListProps) {
  const totalItems = threads.reduce((total, thread) => total + 1 + thread.replies.length, 0);
  let cursor = 0;

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
            showReply={!disableActions}
            onReplyClick={onReplyClick ? () => onReplyClick(thread.comment.commentId) : undefined}
            showOptions={
              !disableActions && currentUserId !== null && currentUserId === thread.comment.author.userId
            }
            onDeleteClick={
              onDeleteClick ? () => onDeleteClick(thread.comment.commentId) : undefined
            }
            onEditClick={
              onEditClick ? () => onEditClick(thread.comment.commentId, thread.comment.content) : undefined
            }
            isEditing={isEditingCommentId === thread.comment.commentId}
            isLast={(() => {
              const isLast = cursor + 1 === totalItems && thread.replies.length === 0;
              cursor += 1;
              return isLast;
            })()}
          />
          {isEditingCommentId === thread.comment.commentId
            ? renderEditor?.(thread.comment.commentId, thread.comment.content, 1)
            : null}
          {replyTargetId === thread.comment.commentId
            ? renderReplyEditor?.(thread.comment.commentId)
            : null}
          {thread.replies.map((reply) => (
            <div key={reply.commentId}>
              <ReplyItem
                author={reply.author}
                createdAt={reply.createdAt}
                content={reply.content}
                isDeleted={reply.isDeleted}
                showOptions={
                  !disableActions && currentUserId !== null && currentUserId === reply.author.userId
                }
                onDeleteClick={onDeleteClick ? () => onDeleteClick(reply.commentId) : undefined}
                onEditClick={
                  onEditClick ? () => onEditClick(reply.commentId, reply.content) : undefined
                }
                isEditing={isEditingCommentId === reply.commentId}
                isLast={(() => {
                  const isLast = cursor + 1 === totalItems;
                  cursor += 1;
                  return isLast;
                })()}
              />
              {isEditingCommentId === reply.commentId
                ? renderEditor?.(reply.commentId, reply.content, 2)
                : null}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
