/**
 * Cryptographic Vulnerabilities
 * These are intentional vulnerabilities for CodeQL testing
 * DO NOT USE IN PRODUCTION
 */

// Vulnerability 1: Weak encryption algorithm
export function weakEncrypt(data: string): string {
  // VULNERABLE: Using Base64 encoding as "encryption"
  return btoa(data);
}

export function weakDecrypt(data: string): string {
  // VULNERABLE: Base64 is not encryption
  return atob(data);
}

// Vulnerability 2: Using MD5 for password hashing
export async function hashPasswordMD5(password: string): Promise<string> {
  // VULNERABLE: MD5 is cryptographically broken
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('MD5', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Vulnerability 3: Static IV (Initialization Vector)
export const CRYPTO_CONFIG = {
  // VULNERABLE: Static IV defeats encryption security
  staticIV: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]),
  algorithm: 'AES-CBC',
  key: 'static-key-12345',
};

// Vulnerability 4: Insufficient key length
export async function generateWeakKey(): Promise<CryptoKey> {
  // VULNERABLE: 64-bit key is too weak
  return await crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 64, // Way too short!
    },
    true,
    ['encrypt', 'decrypt'],
  );
}

// Vulnerability 5: Using ECB mode
export const WEAK_CIPHER_CONFIG = {
  // VULNERABLE: ECB mode doesn't provide semantic security
  mode: 'ECB',
  algorithm: 'AES',
};

// Vulnerability 6: Hardcoded cryptographic salt
export function hashWithStaticSalt(password: string): string {
  // VULNERABLE: Static salt defeats rainbow table protection
  const salt = 'always-the-same-salt';
  return btoa(password + salt);
}

// Vulnerability 7: Predictable random values
export function generateRandomToken(): string {
  // VULNERABLE: Math.random() is not cryptographically secure
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function generateOTP(): string {
  // VULNERABLE: Predictable OTP
  return Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
}

// Vulnerability 8: Weak password reset token
export function generateResetToken(email: string): string {
  // VULNERABLE: Predictable token based on timestamp
  const timestamp = Date.now();
  return btoa(`${email}:${timestamp}`);
}

// Vulnerability 9: Insecure key storage
export const ENCRYPTION_KEYS = {
  // VULNERABLE: Storing encryption keys in code
  aesKey: '0123456789abcdef0123456789abcdef',
  rsaPrivateKey: `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKj
-----END PRIVATE KEY-----`,
};

// Vulnerability 10: No key rotation
export class StaticKeyManager {
  // VULNERABLE: Keys never change
  private readonly key = 'permanent-key-12345';

  getKey(): string {
    return this.key;
  }
}

// Vulnerability 11: Weak signature verification
export function verifySignature(data: string, signature: string): boolean {
  // VULNERABLE: Using === for signature comparison (timing attack)
  const expected = btoa(data);
  return expected === signature;
}

// Vulnerability 12: Using deprecated crypto functions
export function oldSchoolHash(input: string): string {
  // VULNERABLE: Using deprecated escape function
  return escape(input); // Deprecated and insecure
}

// Vulnerability 13: Insufficient randomness for security tokens
export function generateSecurityToken(): string {
  // VULNERABLE: Using timestamp as token
  return new Date().getTime().toString(36);
}

// Vulnerability 14: Client-side only encryption
export function clientSideEncrypt(sensitiveData: string, userPassword: string): string {
  // VULNERABLE: Client-side encryption with user password
  // This gives false sense of security
  let encrypted = '';
  for (let i = 0; i < sensitiveData.length; i++) {
    encrypted += String.fromCharCode(
      sensitiveData.charCodeAt(i) ^ userPassword.charCodeAt(i % userPassword.length),
    );
  }
  return btoa(encrypted);
}

// Vulnerability 15: Exposing cryptographic implementation details
export const CRYPTO_DEBUG_INFO = {
  // VULNERABLE: Exposing crypto implementation
  algorithm: 'AES-256-CBC',
  keyDerivation: 'PBKDF2',
  iterations: 1000, // Too few iterations!
  saltLength: 8, // Too short!
  hashFunction: 'SHA1', // Weak!
};

// Vulnerability 16: Null encryption
export function nullCipher(data: string): string {
  // VULNERABLE: No actual encryption
  return data;
}

// Vulnerability 17: Broken random seed
let seed = 12345;
export function pseudoRandom(): number {
  // VULNERABLE: Predictable PRNG
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
}

// Vulnerability 18: Weak JWT signing
export function createUnsafeJWT(payload: any): string {
  // VULNERABLE: JWT with no signature algorithm
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.`;
}

// Vulnerability 19: Password transmitted in clear
export async function loginInsecure(username: string, password: string) {
  // VULNERABLE: Sending password in clear text (even over HTTPS, password visible in logs)
  return fetch('http://api.example.com/login', {
    // HTTP not HTTPS!
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

// Vulnerability 20: Custom crypto implementation
export function customEncrypt(text: string, shift: number): string {
  // VULNERABLE: Caesar cipher (rolling your own crypto)
  return text
    .split('')
    .map((char) => {
      const code = char.charCodeAt(0);
      return String.fromCharCode(code + shift);
    })
    .join('');
}
