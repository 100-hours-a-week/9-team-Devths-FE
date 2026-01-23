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
