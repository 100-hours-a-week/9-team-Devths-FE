import { type QueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react';

import {
  ALLOWED_FILE_MIME_TYPES,
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_ATTACHMENT_FILE_SIZE_BYTES,
  MAX_IMAGE_ATTACHMENTS_PER_PICK,
  MESSAGE_PAGE_SIZE,
  MESSAGE_SEND_DESTINATION,
  PDF_FILE_EXTENSION_REGEX,
} from '@/constants/chat';
import { fetchChatMessages } from '@/lib/api/chatMessages';
import { applyRealtimeRoomMessage } from '@/lib/chat/realtimeMessageCache';
import { chatStompManager } from '@/lib/chat/stompManager';
import { useImageProcessor } from '@/lib/hooks/useImageProcessor';
import { toast } from '@/lib/toast/store';
import { uploadFile } from '@/lib/upload/uploadFile';

import type { SendChatMessagePayload } from '@/lib/api/chatMessages';

type Params = {
  roomId: number | null;
  queryClient: QueryClient;
};

function isPdfFile(file: File): boolean {
  const mimeType = file.type.trim().toLowerCase();
  if (mimeType && ALLOWED_FILE_MIME_TYPES.has(mimeType)) {
    return true;
  }

  return PDF_FILE_EXTENSION_REGEX.test(file.name);
}

function resolveAttachmentMimeType(file: File, isImageAttachment: boolean): string {
  if (isImageAttachment) {
    return file.type || 'application/octet-stream';
  }

  // Some environments return empty/variant MIME for PDF. Normalize to application/pdf.
  return isPdfFile(file) ? 'application/pdf' : file.type || 'application/octet-stream';
}

export function useAttachmentHandler({ roomId, queryClient }: Params) {
  const { compress } = useImageProcessor();
  const [isAttachmentUploading, setIsAttachmentUploading] = useState(false);
  const [isAttachmentPickerOpen, setIsAttachmentPickerOpen] = useState(false);
  const [attachmentValidationMessage, setAttachmentValidationMessage] = useState<string | null>(
    null,
  );
  const imageAttachmentInputRef = useRef<HTMLInputElement>(null);
  const fileAttachmentInputRef = useRef<HTMLInputElement>(null);
  const attachmentEchoFallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (attachmentEchoFallbackTimerRef.current !== null) {
      clearTimeout(attachmentEchoFallbackTimerRef.current);
      attachmentEchoFallbackTimerRef.current = null;
    }
  }, [roomId]);

  const openAttachmentValidationModal = useCallback((message: string) => {
    setIsAttachmentPickerOpen(false);
    setAttachmentValidationMessage(message);
  }, []);

  const handleAttachmentButtonClick = useCallback(() => {
    if (isAttachmentUploading) {
      return;
    }

    setIsAttachmentPickerOpen(true);
  }, [isAttachmentUploading]);

  const handlePickImageAttachments = useCallback(() => {
    if (isAttachmentUploading) {
      return;
    }

    setIsAttachmentPickerOpen(false);
    imageAttachmentInputRef.current?.click();
  }, [isAttachmentUploading]);

  const handlePickFileAttachment = useCallback(() => {
    if (isAttachmentUploading) {
      return;
    }

    setIsAttachmentPickerOpen(false);
    fileAttachmentInputRef.current?.click();
  }, [isAttachmentUploading]);

  const handleAttachmentChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(event.target.files ?? []);
      event.target.value = '';

      if (selectedFiles.length === 0 || roomId === null || isAttachmentUploading) {
        return;
      }

      const imageFiles = selectedFiles.filter((file) => ALLOWED_IMAGE_MIME_TYPES.has(file.type));
      const nonImageFiles = selectedFiles.filter(
        (file) => !ALLOWED_IMAGE_MIME_TYPES.has(file.type),
      );

      if (imageFiles.length > 0 && nonImageFiles.length > 0) {
        openAttachmentValidationModal('이미지와 파일은 동시에 첨부할 수 없습니다.');
        return;
      }

      if (imageFiles.length > MAX_IMAGE_ATTACHMENTS_PER_PICK) {
        openAttachmentValidationModal(
          `이미지는 한 번에 최대 ${MAX_IMAGE_ATTACHMENTS_PER_PICK}장까지 첨부할 수 있습니다.`,
        );
        return;
      }

      if (nonImageFiles.length > 1) {
        openAttachmentValidationModal('파일은 한 번에 1개만 첨부할 수 있습니다.');
        return;
      }

      for (const file of selectedFiles) {
        if (file.size > MAX_ATTACHMENT_FILE_SIZE_BYTES) {
          openAttachmentValidationModal('파일 용량은 5MB 이하만 첨부할 수 있습니다.');
          return;
        }
      }

      if (nonImageFiles.length === 1 && !isPdfFile(nonImageFiles[0]!)) {
        openAttachmentValidationModal('파일 첨부는 PDF 형식만 지원합니다.');
        return;
      }

      setIsAttachmentUploading(true);

      try {
        for (const rawFile of selectedFiles) {
          const isImageAttachment = ALLOWED_IMAGE_MIME_TYPES.has(rawFile.type);
          const file = isImageAttachment ? await compress(rawFile) : rawFile;
          const normalizedMimeType = resolveAttachmentMimeType(file, isImageAttachment);

          const uploaded = await uploadFile({
            file,
            category: 'AI_CHAT_ATTACHMENT',
            refType: 'CHATROOM',
            refId: roomId,
            mimeType: normalizedMimeType,
          });

          const payload: SendChatMessagePayload = isImageAttachment
            ? {
                roomId,
                type: 'IMAGE',
                content: null,
                s3Key: uploaded.s3Key,
              }
            : {
                roomId,
                type: 'PDF',
                content: uploaded.s3Key,
                s3Key: uploaded.s3Key,
              };

          const published = chatStompManager.publishJson(MESSAGE_SEND_DESTINATION, payload);
          if (!published) {
            toast('첨부 메시지 전송에 실패했습니다. 잠시 후 다시 시도해 주세요.');
            return;
          }

          // STOMP echo fallback: 백엔드가 FILE/IMAGE 메시지를 브로드캐스트하지 않는 경우
          // 2초 후 REST API로 최신 메시지를 가져와 캐시에 병합합니다.
          if (attachmentEchoFallbackTimerRef.current !== null) {
            clearTimeout(attachmentEchoFallbackTimerRef.current);
          }
          const fallbackRoomId = roomId;
          attachmentEchoFallbackTimerRef.current = setTimeout(() => {
            attachmentEchoFallbackTimerRef.current = null;
            void fetchChatMessages(fallbackRoomId, { size: MESSAGE_PAGE_SIZE }).then((result) => {
              if (!result.ok || !result.json || !('data' in result.json) || !result.json.data) {
                return;
              }
              for (const msg of result.json.data.messages) {
                applyRealtimeRoomMessage(queryClient, {
                  roomId: fallbackRoomId,
                  size: MESSAGE_PAGE_SIZE,
                  message: msg,
                });
              }
            });
          }, 2000);
        }
      } catch (error) {
        const err = error as Error;
        toast(err.message || '파일 업로드에 실패했습니다.');
      } finally {
        setIsAttachmentUploading(false);
      }
    },
    [compress, isAttachmentUploading, openAttachmentValidationModal, queryClient, roomId],
  );

  return {
    isAttachmentUploading,
    isAttachmentPickerOpen,
    setIsAttachmentPickerOpen,
    attachmentValidationMessage,
    setAttachmentValidationMessage,
    imageAttachmentInputRef,
    fileAttachmentInputRef,
    handleAttachmentButtonClick,
    handlePickImageAttachments,
    handlePickFileAttachment,
    handleAttachmentChange,
  };
}
