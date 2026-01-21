/**
 * Insecure Configuration and Authentication Vulnerabilities
 * These are intentional vulnerabilities for CodeQL testing
 * DO NOT USE IN PRODUCTION
 */

// Vulnerability 1: Weak CORS configuration
export const CORS_CONFIG = {
  // VULNERABLE: Allowing all origins
  allowedOrigins: '*',
  credentials: true,
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE'],
};

// Vulnerability 2: Disabled security features
export const SECURITY_CONFIG = {
  // VULNERABLE: Disabled security features
  xssProtection: false,
  contentSecurityPolicy: false,
  frameGuard: false,
  hsts: false,
  noSniff: false,
};

// Vulnerability 3: Weak password validation
export function validatePassword(password: string): boolean {
  // VULNERABLE: Weak password requirements
  return password.length >= 4;
}

// Vulnerability 4: Insecure random number generation
export function generateToken(): string {
  // VULNERABLE: Using Math.random() for security-sensitive operations
  return Math.random().toString(36).substring(2);
}

export function generateSessionId(): string {
  // VULNERABLE: Predictable session ID
  return Date.now().toString();
}

// Vulnerability 5: No rate limiting
export async function login(username: string, password: string) {
  // VULNERABLE: No rate limiting on login attempts
  return fetch('/api/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

// Vulnerability 6: Missing authentication check
export async function deleteUser(userId: string) {
  // VULNERABLE: No authentication check before critical operation
  return fetch(`/api/users/${userId}`, {
    method: 'DELETE',
  });
}

// Vulnerability 7: Insufficient authorization
export async function viewUserData(userId: string) {
  // VULNERABLE: No authorization check - any user can view any user's data
  return fetch(`/api/users/${userId}/sensitive-data`);
}

// Vulnerability 8: Trusting client-side data
export async function processPayment(amount: number, isAdmin: boolean) {
  // VULNERABLE: Trusting client-side role/permission data
  if (isAdmin) {
    amount = 0; // Free for admins
  }
  return fetch('/api/payment', {
    method: 'POST',
    body: JSON.stringify({ amount, isAdmin }),
  });
}

// Vulnerability 9: Unsafe redirect
export function redirectUser(url: string) {
  // VULNERABLE: Unvalidated redirect
  window.location.href = url;
}

// Vulnerability 10: Missing CSRF protection
export async function updateProfile(data: any) {
  // VULNERABLE: No CSRF token
  return fetch('/api/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// Vulnerability 11: Exposing stack traces
export function handleError(error: Error) {
  // VULNERABLE: Exposing full stack trace to user
  alert(`Error: ${error.message}\n\nStack trace:\n${error.stack}`);
}

// Vulnerability 12: Insecure direct object reference (IDOR)
export async function getDocument(docId: string) {
  // VULNERABLE: Direct object reference without access control
  return fetch(`/api/documents/${docId}`);
}

// Vulnerability 13: Missing input validation
export async function createUser(userData: any) {
  // VULNERABLE: No input validation
  return fetch('/api/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

// Vulnerability 14: Unrestricted file upload
export async function uploadFile(file: File) {
  // VULNERABLE: No file type or size validation
  const formData = new FormData();
  formData.append('file', file);

  return fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });
}

// Vulnerability 15: Information disclosure
export const DEBUG_INFO = {
  // VULNERABLE: Exposing internal information
  environment: 'production',
  apiVersion: 'v2.1.3',
  serverIP: '192.168.1.50',
  databaseHost: 'db-prod-01.internal',
  internalEndpoints: ['/admin', '/debug', '/metrics'],
};

// Vulnerability 16: Broken access control
export function isAdmin(user: any): boolean {
  // VULNERABLE: Client-side role check
  return user.role === 'admin';
}

export async function performAdminAction(action: string) {
  // VULNERABLE: No server-side verification
  return fetch('/api/admin/action', {
    method: 'POST',
    body: JSON.stringify({ action }),
  });
}

// Vulnerability 17: Using deprecated/insecure libraries
export function encryptData(data: string): string {
  // VULNERABLE: Using deprecated btoa for "encryption"
  return btoa(data);
}

// Vulnerability 18: Unsafe event handlers
export function attachUnsafeHandler(element: HTMLElement, code: string) {
  // VULNERABLE: Using eval in event handler
  element.onclick = () => {
    eval(code);
  };
}

// Vulnerability 19: Missing security headers
export const HEADERS = {
  // VULNERABLE: Missing critical security headers
  'Content-Type': 'application/json',
  // Missing: X-Frame-Options, X-Content-Type-Options, CSP, etc.
};

// Vulnerability 20: Timing attack vulnerability
export function comparePasswords(input: string, stored: string): boolean {
  // VULNERABLE: Timing attack - early return reveals information
  if (input.length !== stored.length) return false;

  for (let i = 0; i < input.length; i++) {
    if (input[i] !== stored[i]) return false;
  }
  return true;
}
