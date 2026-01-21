/**
 * Sensitive Data Exposure Vulnerabilities
 * These are intentional vulnerabilities for CodeQL testing
 * DO NOT USE IN PRODUCTION
 */

// Vulnerability 1: Hardcoded API keys
export const API_CONFIG = {
  // VULNERABLE: Hardcoded credentials
  apiKey: 'sk-1234567890abcdefghijklmnopqrstuvwxyz',
  secretKey: 'secret_key_DO_NOT_COMMIT',
  awsAccessKey: 'AKIAIOSFODNN7EXAMPLE',
  awsSecretKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
  databasePassword: 'MyP@ssw0rd123!',
  jwtSecret: 'super-secret-jwt-key-12345',
};

// Vulnerability 2: Storing sensitive data in localStorage
export function storeUserCredentials(username: string, password: string, token: string) {
  // VULNERABLE: Storing sensitive data in localStorage
  localStorage.setItem('username', username);
  localStorage.setItem('password', password); // Never store passwords!
  localStorage.setItem('authToken', token);
  localStorage.setItem('creditCard', '4532-1234-5678-9010');
  localStorage.setItem('ssn', '123-45-6789');
}

// Vulnerability 3: Logging sensitive information
export function logUserData(user: any) {
  // VULNERABLE: Logging sensitive data
  console.log('User password:', user.password);
  console.log('Credit card:', user.creditCard);
  console.log('Full user object:', user);
  console.error('Authentication failed for:', user.email, user.password);
}

// Vulnerability 4: Exposing secrets in error messages
export function authenticateUser(password: string) {
  const correctPassword = 'Admin123!@#';

  if (password !== correctPassword) {
    // VULNERABLE: Exposing secret in error message
    throw new Error(`Invalid password. Expected: ${correctPassword}, Got: ${password}`);
  }
}

// Vulnerability 5: Weak cryptographic key
export const ENCRYPTION_CONFIG = {
  // VULNERABLE: Weak and hardcoded encryption key
  key: '12345',
  algorithm: 'MD5', // Weak algorithm
  salt: 'static-salt', // Static salt
};

// Vulnerability 6: Storing tokens in sessionStorage
export function saveAuthToken(token: string, refreshToken: string) {
  // VULNERABLE: Storing JWT tokens in sessionStorage
  sessionStorage.setItem('jwt', token);
  sessionStorage.setItem('refreshToken', refreshToken);
  sessionStorage.setItem('apiSecret', 'my-api-secret-key');
}

// Vulnerability 7: Hardcoded database credentials
export const DB_CONFIG = {
  // VULNERABLE: Hardcoded database credentials
  host: 'db.example.com',
  port: 5432,
  username: 'admin',
  password: 'P@ssw0rd123',
  database: 'production_db',
  connectionString: 'postgresql://admin:P@ssw0rd123@db.example.com:5432/production_db',
};

// Vulnerability 8: Exposing private keys
export const PRIVATE_KEY = `-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA1234567890abcdefghijklmnopqrstuvwxyz
-----END RSA PRIVATE KEY-----`;

// Vulnerability 9: Cookies with sensitive data (no httpOnly, no secure)
export function setInsecureCookie(sessionId: string, userId: string) {
  // VULNERABLE: Storing sensitive data in accessible cookies
  document.cookie = `sessionId=${sessionId}`;
  document.cookie = `userId=${userId}`;
  document.cookie = `adminToken=super-secret-admin-token`;
}

// Vulnerability 10: Exposing internal paths and configuration
export const INTERNAL_CONFIG = {
  // VULNERABLE: Exposing internal system information
  internalApiUrl: 'http://192.168.1.100:8080/admin',
  debugMode: true,
  stackTraceEnabled: true,
  adminEmail: 'admin@internal-company.com',
  backupPath: '/var/backups/sensitive/',
};

// Vulnerability 11: Hardcoded OAuth credentials
export const OAUTH_CONFIG = {
  // VULNERABLE: Hardcoded OAuth secrets
  clientId: 'my-oauth-client-id-12345',
  clientSecret: 'my-oauth-client-secret-67890',
  googleApiKey: 'AIzaSyDaGmWKa4JsXZ-HjGw7ISLn_3namBGewQe',
  facebookAppSecret: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
};

// Vulnerability 12: Sending passwords in URL parameters
export function loginWithUrlParams(username: string, password: string) {
  // VULNERABLE: Sending credentials in URL
  const url = `https://api.example.com/login?username=${username}&password=${password}`;
  return fetch(url);
}
