export const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as const;

export const FILE_MIME_TYPES = ['application/pdf'] as const;

export type ImageMimeType = (typeof IMAGE_MIME_TYPES)[number];
export type FileMimeType = (typeof FILE_MIME_TYPES)[number];

export type AttachmentConstraints = {
  maxImages: number;
  maxFiles: number;
  maxSizeMB: number;
  imageMimeTypes: readonly string[];
  fileMimeTypes: readonly string[];
};

export const LLM_ATTACHMENT_CONSTRAINTS: AttachmentConstraints = {
  maxImages: 9,
  maxFiles: 1,
  maxSizeMB: 10,
  imageMimeTypes: IMAGE_MIME_TYPES,
  fileMimeTypes: FILE_MIME_TYPES,
};

export const LLM_PDF_MAX_PAGES = 10;

export const CHAT_ATTACHMENT_CONSTRAINTS: AttachmentConstraints = {
  maxImages: 9,
  maxFiles: 1,
  maxSizeMB: 5,
  imageMimeTypes: IMAGE_MIME_TYPES,
  fileMimeTypes: FILE_MIME_TYPES,
};

export const BOARD_IMAGE_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png'] as const;
export const BOARD_FILE_MIME_TYPES = ['application/pdf'] as const;
export const BOARD_FILE_MAX_SIZE_MB = 10;

export const BOARD_ATTACHMENT_CONSTRAINTS: AttachmentConstraints = {
  maxImages: 10,
  maxFiles: 5,
  maxSizeMB: BOARD_FILE_MAX_SIZE_MB,
  imageMimeTypes: BOARD_IMAGE_MIME_TYPES,
  fileMimeTypes: BOARD_FILE_MIME_TYPES,
};
