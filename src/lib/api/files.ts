import { apiRequest } from '@/lib/api/client';

import type { ApiResponse } from '@/types/api';

export type PresignedSignupRequest = {
  fileName: string;
  mimeType: string;
};

export type PresignedSignupData = {
  presignedUrl: string;
  s3Key: string;
};

export type PostPresignedSignupResult = {
  ok: boolean;
  status: number;
  json: ApiResponse<PresignedSignupData> | null;
};

export async function postPresignedSignup(
  body: PresignedSignupRequest,
): Promise<PostPresignedSignupResult> {
  const { ok, status, json } = await apiRequest<PresignedSignupData>({
    method: 'POST',
    path: '/api/files/presigned/signup',
    body,
    withAuth: false,
  });

  return {
    ok,
    status,
    json: ok ? (json as ApiResponse<PresignedSignupData> | null) : null,
  };
}
