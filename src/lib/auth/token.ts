const ACCESS_TOKEN_KEY = 'devths_access_token';
const TEMP_TOKEN_KEY = 'devths_signup_temp_token';

export function setAccessToken(token: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function clearAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export function setTempToken(token: string) {
  sessionStorage.setItem(TEMP_TOKEN_KEY, token);
}

export function getTempToken() {
  return sessionStorage.getItem(TEMP_TOKEN_KEY);
}

export function clearTempToken() {
  sessionStorage.removeItem(TEMP_TOKEN_KEY);
}
