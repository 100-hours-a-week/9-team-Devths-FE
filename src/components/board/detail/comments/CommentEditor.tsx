'use client';

import CommentComposer from '@/components/board/detail/CommentComposer';

type CommentEditorProps = {
  placeholder?: string;
  onSubmit?: (content: string) => void | Promise<void> | boolean;
  className?: string;
  maxLength?: number;
};

export default function CommentEditor({
  placeholder,
  onSubmit,
  className,
  maxLength,
}: CommentEditorProps) {
  return (
    <CommentComposer
      placeholder={placeholder}
      onSubmit={onSubmit}
      className={className}
      maxLength={maxLength}
    />
  );
}
