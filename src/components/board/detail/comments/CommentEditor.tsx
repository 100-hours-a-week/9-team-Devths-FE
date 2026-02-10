'use client';

import CommentComposer from '@/components/board/detail/CommentComposer';

type CommentEditorProps = {
  placeholder?: string;
  onSubmit?: (content: string) => void | Promise<void> | boolean;
  className?: string;
};

export default function CommentEditor({ placeholder, onSubmit, className }: CommentEditorProps) {
  return <CommentComposer placeholder={placeholder} onSubmit={onSubmit} className={className} />;
}
