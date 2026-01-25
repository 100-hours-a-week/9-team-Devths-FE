import { apiRequest } from '@/lib/api/client';

import type { ApiErrorResponse, ApiResponse } from '@/types/api';

export type SignupRequest = {
  email: string;
  nickname: string;
  interests?: string[];
  tempToken: string;
  profileImageS3Key?: string;
};

type SignupPayload = {
  email: string;
  nickname: string;
  interests: string[];
  tempToken: string;
  profileImageS3Key?: string;
};

export type SignupData = {
  nickname: string;
  profileImage: { id: number; url: string } | null;
  stats: { followerCount: number; followingCount: number };
  interests: string[];
};

export type PostSignupResult = {
  ok: boolean;
  status: number;
  json: (ApiResponse<SignupData> | ApiErrorResponse) | null;
};

export async function postSignup(body: SignupRequest): Promise<PostSignupResult> {
  const payload: SignupPayload = {
    email: body.email,
    nickname: body.nickname,
    tempToken: body.tempToken,
    interests: body.interests ?? [],
    ...(body.profileImageS3Key ? { profileImageS3Key: body.profileImageS3Key } : {}),
  };

  const { ok, status, json } = await apiRequest<SignupData>({
    method: 'POST',
    path: '/api/users',
    body: payload,
    withAuth: false,
  });

  return { ok, status, json };
}
