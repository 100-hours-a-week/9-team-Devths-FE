export const IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
] as const;

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
