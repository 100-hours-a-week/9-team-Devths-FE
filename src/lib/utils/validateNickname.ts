const FORBIDDEN_WORDS = ['admin', 'administrator', '운영자', '관리자'];
const SPECIAL_CHAR_REGEX = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~\s]/;

type ValidationResult = {
  isValid: boolean;
  errorMessage: string | null;
};

export function validateNickname(nickname: string): ValidationResult {
  if (!nickname) {
    return { isValid: false, errorMessage: null };
  }

  if (nickname.length < 2) {
    return { isValid: false, errorMessage: '닉네임은 2자 이상이어야 합니다.' };
  }

  if (nickname.length > 10) {
    return { isValid: false, errorMessage: '닉네임은 10자 이하여야 합니다.' };
  }

  if (SPECIAL_CHAR_REGEX.test(nickname)) {
    return { isValid: false, errorMessage: '공백 및 특수문자는 사용할 수 없습니다.' };
  }

  const lowerNickname = nickname.toLowerCase();
  for (const word of FORBIDDEN_WORDS) {
    if (lowerNickname.includes(word.toLowerCase())) {
      return { isValid: false, errorMessage: '사용할 수 없는 닉네임입니다.' };
    }
  }

  return { isValid: true, errorMessage: null };
}
