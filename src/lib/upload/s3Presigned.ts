export type UploadToPresignedUrlArgs = {
  presignedUrl: string;
  file: File;
};

export async function uploadToPresignedUrl({
  presignedUrl,
  file,
}: UploadToPresignedUrlArgs): Promise<void> {
  const res = await fetch(presignedUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type,
    },
    body: file,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(
      text ? `S3 업로드 실패: ${res.status} ${text}` : `S3 업로드 실패: ${res.status}`,
    );
  }
}
