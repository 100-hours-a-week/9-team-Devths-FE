import { useMutation } from '@tanstack/react-query';

import type {
  CommentCreatePayload,
  CommentDeletePayload,
  CommentUpdatePayload,
} from '@/types/boardDetail';

export function useCreateCommentMutation() {
  return useMutation({
    mutationFn: async (_payload: CommentCreatePayload) => {
      throw new Error('Not implemented');
    },
  });
}

export function useUpdateCommentMutation() {
  return useMutation({
    mutationFn: async (_payload: CommentUpdatePayload) => {
      throw new Error('Not implemented');
    },
  });
}

export function useDeleteCommentMutation() {
  return useMutation({
    mutationFn: async (_payload: CommentDeletePayload) => {
      throw new Error('Not implemented');
    },
  });
}
