const ACCESS_TOKEN_KEY = 'devths_access_token';
const TEMP_TOKEN_KEY = 'devths_signup_temp_token';
const SIGNUP_EMAIL_KEY = 'devths_signup_email';

export function setAccessToken(token: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function getAccessToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

function decodeBase64Url(value: string) {
  const padded = value
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .padEnd(Math.ceil(value.length / 4) * 4, '=');
  return atob(padded);
}

export function getUserIdFromAccessToken(): number | null {
  if (typeof window === 'undefined') return null;
  const token = getAccessToken();
  if (!token) return null;

  const parts = token.split('.');
  if (parts.length < 2) return null;

  try {
    const payloadJson = decodeBase64Url(parts[1]);
    const payload = JSON.parse(payloadJson) as Record<string, unknown>;

    const candidates = [
      payload.userId,
      payload.id,
      payload.sub,
      payload.user_id,
    ];

    for (const value of candidates) {
      if (typeof value === 'number' && Number.isFinite(value)) return value;
      if (typeof value === 'string' && value.trim() !== '') {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) return parsed;
      }
    }

    return null;
  } catch {
    return null;
  }
}

export function clearAccessToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export function setTempToken(token: string) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(TEMP_TOKEN_KEY, token);
}

export function getTempToken() {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(TEMP_TOKEN_KEY);
}

export function clearTempToken() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(TEMP_TOKEN_KEY);
}

export function setSignupEmail(email: string) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(SIGNUP_EMAIL_KEY, email);
}

export function getSignupEmail() {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(SIGNUP_EMAIL_KEY);
}

export function clearSignupEmail() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(SIGNUP_EMAIL_KEY);
}

export function clearSignupContext() {
  clearTempToken();
  clearSignupEmail();
}
