import { useMemo, useState } from 'react';

import { validateBoardCreateContent, validateBoardCreateTitle } from '@/lib/validators/boardCreate';

import type { BoardTag } from '@/types/board';

export function useBoardForm() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [tags, setTags] = useState<BoardTag[]>([]);

  const titleError = useMemo(() => validateBoardCreateTitle(title), [title]);
  const contentError = useMemo(() => validateBoardCreateContent(content), [content]);
  const isSubmitEnabled = useMemo(() => !titleError && !contentError, [titleError, contentError]);

  return {
    title,
    setTitle,
    content,
    setContent,
    isPreview,
    setIsPreview,
    tags,
    setTags,
    titleError,
    contentError,
    isSubmitEnabled,
  };
}
