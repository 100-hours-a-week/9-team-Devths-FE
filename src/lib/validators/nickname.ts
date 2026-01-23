const MIN = 2;
const MAX = 10;

const hasWhitespace = (s: string) => /\s/.test(s);

const hasSpecialChar = (s: string) => /[^A-Za-z0-9가-힣]/.test(s);

const hasForbiddenWord = (s: string) => {
  const lower = s.toLowerCase();
  return lower.includes('admin') || lower.includes('운영자');
};

export function getNicknameErrorMessage(nickname: string): string | null {
  const raw = nickname;
  const value = nickname.trim();

  if (value.length === 0) return '*닉네임을 입력해주세요.';

  if (hasWhitespace(raw) || hasSpecialChar(raw)) {
    return '*띄어쓰기와 특수 문자를 제거해주세요.';
  }

  if (value.length < MIN) return '*닉네임이 너무 짧습니다.';
  if (value.length > MAX) return '*닉네임은 10자 이내여야 합니다.';

  if (hasForbiddenWord(value)) return '*유효하지 않은 닉네임입니다.';

  return null;
}
