import { useCallback, useState } from 'react';

import type { BoardAttachment, BoardAttachmentType } from '@/types/boardCreate';

function createAttachmentId(file: File) {
  return `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useBoardAttachments() {
  const [attachments, setAttachments] = useState<BoardAttachment[]>([]);

  const addAttachments = useCallback((files: File[], type: BoardAttachmentType) => {
    const newAttachments = files.map((file) => ({
      id: createAttachmentId(file),
      type,
      name: file.name,
      size: file.size,
      file,
      status: 'PENDING' as const,
    }));
    setAttachments((prev) => [...prev, ...newAttachments]);
    return newAttachments;
  }, []);

  const updateAttachment = useCallback((id: string, patch: Partial<BoardAttachment>) => {
    setAttachments((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
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
    updateAttachment,
    removeAttachment,
    clearAttachments,
  };
}
