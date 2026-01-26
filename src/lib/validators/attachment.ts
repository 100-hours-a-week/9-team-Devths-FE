import type { AttachmentConstraints } from '@/constants/attachment';

export type AttachmentErrorCode =
  | 'TOO_MANY_IMAGES'
  | 'TOO_MANY_FILES'
  | 'FILE_TOO_LARGE'
  | 'INVALID_MIME_TYPE';

export type AttachmentError = {
  code: AttachmentErrorCode;
  fileName: string;
  message: string;
};

export type ValidateFilesResult = {
  okFiles: File[];
  errors: AttachmentError[];
};

function isImageMime(
  mimeType: string,
  allowedMimes: readonly string[]
): boolean {
  return allowedMimes.includes(mimeType);
}

function isFileMime(mimeType: string, allowedMimes: readonly string[]): boolean {
  return allowedMimes.includes(mimeType);
}

export function validateFiles(
  files: File[],
  constraints: AttachmentConstraints,
  existingImages: number = 0,
  existingFiles: number = 0
): ValidateFilesResult {
  const okFiles: File[] = [];
  const errors: AttachmentError[] = [];

  const maxSizeBytes = constraints.maxSizeMB * 1024 * 1024;

  let imageCount = existingImages;
  let fileCount = existingFiles;

  for (const file of files) {
    const isImage = isImageMime(file.type, constraints.imageMimeTypes);
    const isFile = isFileMime(file.type, constraints.fileMimeTypes);

    if (!isImage && !isFile) {
      errors.push({
        code: 'INVALID_MIME_TYPE',
        fileName: file.name,
        message: `지원하지 않는 파일 형식입니다: ${file.type || '알 수 없음'}`,
      });
      continue;
    }

    if (file.size > maxSizeBytes) {
      errors.push({
        code: 'FILE_TOO_LARGE',
        fileName: file.name,
        message: `파일 크기가 ${constraints.maxSizeMB}MB를 초과합니다.`,
      });
      continue;
    }

    if (isImage) {
      if (imageCount >= constraints.maxImages) {
        errors.push({
          code: 'TOO_MANY_IMAGES',
          fileName: file.name,
          message: `이미지는 최대 ${constraints.maxImages}개까지 첨부할 수 있습니다.`,
        });
        continue;
      }
      imageCount++;
    }

    if (isFile) {
      if (fileCount >= constraints.maxFiles) {
        errors.push({
          code: 'TOO_MANY_FILES',
          fileName: file.name,
          message: `파일은 최대 ${constraints.maxFiles}개까지 첨부할 수 있습니다.`,
        });
        continue;
      }
      fileCount++;
    }

    okFiles.push(file);
  }

  return { okFiles, errors };
}
