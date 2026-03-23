import { z } from 'zod';

export const nicknameSchema = z
  .string()
  .min(2, '닉네임은 2자 이상이어야 합니다.')
  .max(10, '닉네임은 10자 이하여야 합니다.')
  .refine(
    (v) => !/\s/.test(v) && !/[^A-Za-z0-9가-힣]/.test(v),
    '공백 및 특수문자는 사용할 수 없습니다.',
  )
  .refine((v) => {
    const lower = v.toLowerCase();
    return !lower.includes('admin') && !lower.includes('운영자');
  }, '사용할 수 없는 닉네임입니다.');
