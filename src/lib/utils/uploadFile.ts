import { postFileMeta, postPresigned } from '@/lib/api/files';

import type { FileCategory, FileRefType, PresignedData, PostFileMetaData } from '@/lib/api/files';

export type UploadFileOptions = {
  file: File;
  category: FileCategory;
  refType: FileRefType;
  refId?: number | null;
  sortOrder?: number;
};

export type UploadFileResult = {
  ok: boolean;
  fileId?: number;
  s3Key?: string;
  error?: string;
};

export async function uploadFile(options: UploadFileOptions): Promise<UploadFileResult> {
  const { file, category, refType, refId, sortOrder = 1 } = options;

  // 1) presigned 발급
  const presignedResult = await postPresigned({
    fileName: file.name,
    mimeType: file.type,
  });

  const presignedData = presignedResult.json?.data as PresignedData | null | undefined;

  if (!presignedResult.ok || !presignedData) {
    return { ok: false, error: 'Failed to get presigned URL' };
  }

  const { presignedUrl, s3Key } = presignedData;

  // 2) S3 PUT 업로드
  try {
    const s3Response = await fetch(presignedUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    });

    if (!s3Response.ok) {
      return { ok: false, error: 'Failed to upload to S3' };
    }
  } catch {
    return { ok: false, error: 'Failed to upload to S3' };
  }

  // 3) 메타 등록
  const metaResult = await postFileMeta({
    originalName: file.name,
    s3Key,
    mimeType: file.type,
    category,
    fileSize: file.size,
    refType,
    refId,
    sortOrder,
  });

  const metaData = metaResult.json?.data as PostFileMetaData | null | undefined;

  if (!metaResult.ok || !metaData) {
    return { ok: false, error: 'Failed to register file metadata' };
  }

  return {
    ok: true,
    fileId: metaData.fileId,
    s3Key: metaData.s3Key ?? s3Key, // 서버가 s3Key를 안 주는 경우 대비
  };
}
