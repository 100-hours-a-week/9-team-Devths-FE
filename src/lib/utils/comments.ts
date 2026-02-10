import type { CommentItem, CommentThread } from '@/types/boardDetail';

function toTimestamp(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

export function groupCommentsByThread(comments: CommentItem[]): CommentThread[] {
  const commentMap = new Map(comments.map((comment) => [comment.commentId, comment]));
  const visibleComments = comments.filter((comment) => {
    if (comment.isDeleted) {
      return false;
    }

    if (comment.parentId === null) {
      return true;
    }

    const parent = commentMap.get(comment.parentId);
    return !parent || !parent.isDeleted;
  });
  const roots: CommentItem[] = [];
  const repliesMap = new Map<number, CommentItem[]>();

  for (const comment of visibleComments) {
    if (comment.parentId === null) {
      roots.push(comment);
    } else {
      const list = repliesMap.get(comment.parentId) ?? [];
      list.push(comment);
      repliesMap.set(comment.parentId, list);
    }
  }

  roots.sort((a, b) => toTimestamp(a.createdAt) - toTimestamp(b.createdAt));

  return roots.map((root) => {
    const replies = repliesMap.get(root.commentId) ?? [];
    replies.sort((a, b) => toTimestamp(a.createdAt) - toTimestamp(b.createdAt));
    return { comment: root, replies };
  });
}
