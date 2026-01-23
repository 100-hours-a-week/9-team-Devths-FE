const SIGNUP_EMAIL_KEY = 'devths_signup_email';

export function setSignupEmail(email: string) {
  sessionStorage.setItem(SIGNUP_EMAIL_KEY, email);
}

export function getSignupEmail() {
  return sessionStorage.getItem(SIGNUP_EMAIL_KEY);
}

export function clearSignupEmail() {
  sessionStorage.removeItem(SIGNUP_EMAIL_KEY);
}
