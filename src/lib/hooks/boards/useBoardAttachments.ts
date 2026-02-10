import { useCallback, useState } from 'react';

import type { BoardAttachment, BoardAttachmentType } from '@/types/boardCreate';

function createAttachmentId(file: File) {
  return `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useBoardAttachments() {
  const [attachments, setAttachments] = useState<BoardAttachment[]>([]);

  const addAttachments = useCallback((files: File[], type: BoardAttachmentType) => {
    setAttachments((prev) => [
      ...prev,
      ...files.map((file) => ({
        id: createAttachmentId(file),
        type,
        name: file.name,
        size: file.size,
        file,
        status: 'PENDING' as const,
      })),
    ]);
  }, []);

  const removeAttachment = useCallback((id: string) => {
    setAttachments((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearAttachments = useCallback(() => {
    setAttachments([]);
  }, []);

  return {
    attachments,
    setAttachments,
    addAttachments,
    removeAttachment,
    clearAttachments,
  };
}
