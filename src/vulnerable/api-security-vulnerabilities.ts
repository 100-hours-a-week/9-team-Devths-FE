/**
 * API Security Vulnerabilities
 * These are intentional vulnerabilities for CodeQL testing
 * DO NOT USE IN PRODUCTION
 */

// Vulnerability 1: Mass Assignment
export async function updateUser(userId: string, userData: any) {
  // VULNERABLE: Allowing all user-provided fields without filtering
  return fetch(`/api/users/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData), // User can set isAdmin: true
  });
}

// Vulnerability 2: Insecure API endpoint construction
export async function fetchData(tableName: string, id: string) {
  // VULNERABLE: User-controlled table name
  const url = `/api/${tableName}/${id}`;
  return fetch(url);
}

// Vulnerability 3: No request validation
export async function processOrder(orderData: string) {
  // VULNERABLE: No validation of request data
  return fetch('/api/orders', {
    method: 'POST',
    body: orderData, // Could be anything
  });
}

// Vulnerability 4: Exposing internal API structure
export const API_ENDPOINTS = {
  // VULNERABLE: Exposing internal API details
  internal: {
    adminPanel: 'http://internal-api.company.local/admin',
    debugging: 'http://internal-api.company.local/debug',
    monitoring: 'http://internal-api.company.local/metrics',
  },
  development: {
    database: 'http://dev-db.company.local:5432',
    cache: 'http://dev-redis.company.local:6379',
  },
};

// Vulnerability 5: JWT token mishandling
export function parseJWT(token: string) {
  // VULNERABLE: Client-side JWT parsing and trusting claims
  const [, payload] = token.split('.');
  const decoded = JSON.parse(atob(payload));

  // VULNERABLE: Trusting client-decoded JWT
  if (decoded.role === 'admin') {
    return { isAdmin: true };
  }
  return { isAdmin: false };
}

// Vulnerability 6: API key in URL
export async function fetchUserData(apiKey: string, userId: string) {
  // VULNERABLE: API key in URL (will be logged)
  return fetch(`/api/users/${userId}?apiKey=${apiKey}`);
}

// Vulnerability 7: Unbounded requests
export async function fetchAllUsers() {
  // VULNERABLE: No pagination, can return massive datasets
  return fetch('/api/users?limit=999999');
}

// Vulnerability 8: No timeout configuration
export async function slowRequest() {
  // VULNERABLE: No timeout - can hang indefinitely
  return fetch('/api/slow-endpoint');
}

// Vulnerability 9: Trusting response without validation
export async function getConfig() {
  // VULNERABLE: Trusting API response without validation
  const response = await fetch('/api/config');
  const config = await response.json();

  // Directly using config without validation
  eval(config.initScript); // Double vulnerability
  return config;
}

// Vulnerability 10: GraphQL query complexity
export async function complexGraphQLQuery(depth: number) {
  // VULNERABLE: Unbounded nested query
  let query = 'query { user {';
  for (let i = 0; i < depth; i++) {
    query += ' friends {';
  }
  query += ' id ';
  for (let i = 0; i < depth; i++) {
    query += '} ';
  }
  query += '}}';

  return fetch('/graphql', {
    method: 'POST',
    body: JSON.stringify({ query }),
  });
}

// Vulnerability 11: Batch request abuse
export async function batchRequests(ids: string[]) {
  // VULNERABLE: No limit on batch size
  return fetch('/api/batch', {
    method: 'POST',
    body: JSON.stringify({ ids }), // Could be millions
  });
}

// Vulnerability 12: API versioning issues
export function getAPIEndpoint(version: string) {
  // VULNERABLE: Unvalidated version parameter
  return `https://api.example.com/${version}/users`;
}

// Vulnerability 13: Excessive data exposure
export async function getUserProfile(userId: string) {
  // VULNERABLE: Returning all fields including sensitive ones
  const response = await fetch(`/api/users/${userId}/profile`);
  const data = await response.json();

  // Returns: password hash, SSN, credit cards, etc.
  return data;
}

// Vulnerability 14: Missing error handling exposes internals
export async function riskyAPICall() {
  try {
    return await fetch('/api/risky');
  } catch (error: any) {
    // VULNERABLE: Exposing error details
    console.log('Database connection failed:', error.message);
    console.log('Connection string:', error.config?.connectionString);
    throw error;
  }
}

// Vulnerability 15: Race condition in API calls
export class UnsafeCounter {
  private count = 0;

  async increment() {
    // VULNERABLE: Race condition - not atomic
    const current = this.count;
    await new Promise((resolve) => setTimeout(resolve, 10));
    this.count = current + 1;
  }
}

// Vulnerability 16: Server-Side Request Forgery (SSRF) preparation
export async function fetchExternalResource(url: string) {
  // VULNERABLE: Unvalidated external URL
  return fetch(url);
}

export async function proxyRequest(targetUrl: string) {
  // VULNERABLE: Server-side request forgery
  return fetch('/api/proxy', {
    method: 'POST',
    body: JSON.stringify({ url: targetUrl }),
  });
}

// Vulnerability 17: Cache poisoning
export async function getCachedData(key: string) {
  // VULNERABLE: User-controlled cache key
  const cacheKey = `user_${key}`;
  return fetch(`/api/cache/${cacheKey}`);
}

// Vulnerability 18: API response splitting
export async function setHeader(value: string) {
  // VULNERABLE: Header injection via API
  return fetch('/api/data', {
    headers: {
      'X-Custom-Header': value, // Can inject \r\n to add headers
    },
  });
}

// Vulnerability 19: Inconsistent authorization
export async function deleteResource(resourceId: string) {
  // VULNERABLE: No authorization check on client side
  // Assumes server will check, but doesn't verify
  return fetch(`/api/resources/${resourceId}`, {
    method: 'DELETE',
  });
}

// Vulnerability 20: API key rotation not handled
export const STATIC_API_KEY = 'api_key_that_never_changes_12345';

export async function makeAuthenticatedRequest(endpoint: string) {
  // VULNERABLE: Using static, never-rotated API key
  return fetch(endpoint, {
    headers: {
      'X-API-Key': STATIC_API_KEY,
    },
  });
}
