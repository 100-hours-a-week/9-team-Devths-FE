import { api, apiRequest } from '@/lib/api/client';

import type { ApiErrorResponse, ApiResponse } from '@/types/api';

export type MeData = {
  nickname: string;
  profileImage: { id: number; url: string } | null;
  stats: { followerCount: number; followingCount: number };
  interests: string[];
};

export type FetchMeResult = {
  ok: boolean;
  status: number;
  json: (ApiResponse<MeData> | ApiErrorResponse) | null;
};

export async function fetchMe(): Promise<FetchMeResult> {
  const { ok, status, json } = await api.get<MeData>('/api/users/me');
  return { ok, status, json };
}

export type UpdateMeRequest = {
  nickname: string;
  interests: string[];
};

export type UpdateMeData = {
  nickname: string;
  interests: string[];
  updatedAt: string;
};

export type UpdateMeResult = {
  ok: boolean;
  status: number;
  json: (ApiResponse<UpdateMeData> | ApiErrorResponse) | null;
};

export async function updateMe(body: UpdateMeRequest): Promise<UpdateMeResult> {
  // 백엔드가 소문자 interests를 기대할 수 있으므로 변환
  const payload = {
    nickname: body.nickname,
    interests: body.interests.map((i) => i.toLowerCase()),
  };
  const { ok, status, json } = await api.put<UpdateMeData>('/api/users/me', payload);
  return { ok, status, json };
}

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

export type UpdateProfileImageRequest = {
  s3Key: string;
};

export type UpdateProfileImageData = {
  profileImage: { id: number; url: string };
};

export async function updateProfileImage(body: UpdateProfileImageRequest) {
  const { ok, status, json } = await api.post<UpdateProfileImageData>(
    '/api/users/me/picture',
    body,
  );
  return { ok, status, json };
}

export async function deleteProfileImage() {
  const { ok, status, json } = await api.delete<void>('/api/users/me/picture');
  return { ok, status, json };
}

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
