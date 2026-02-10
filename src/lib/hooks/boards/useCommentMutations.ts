import { useMutation } from '@tanstack/react-query';

import { createBoardComment, deleteBoardComment, updateBoardComment } from '@/lib/api/boards';
import type {
  CommentCreatePayload,
  CommentDeletePayload,
  CommentUpdatePayload,
} from '@/types/boardDetail';

export function useCreateCommentMutation() {
  return useMutation({
    mutationFn: async (payload: CommentCreatePayload) => {
      return createBoardComment(payload.postId, {
        parentId: payload.parentId ?? null,
        content: payload.content,
      });
    },
  });
}

export function useUpdateCommentMutation() {
  return useMutation({
    mutationFn: async (payload: CommentUpdatePayload) => {
      return updateBoardComment(payload.postId, payload.commentId, { content: payload.content });
    },
  });
}

export function useDeleteCommentMutation() {
  return useMutation({
    mutationFn: async (payload: CommentDeletePayload) => {
      return deleteBoardComment(payload.postId, payload.commentId);
    },
  });
}
