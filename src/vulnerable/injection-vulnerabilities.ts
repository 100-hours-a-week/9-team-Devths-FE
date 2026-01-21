/**
 * Injection Vulnerabilities
 * These are intentional vulnerabilities for CodeQL testing
 * DO NOT USE IN PRODUCTION
 */

// Vulnerability 1: SQL Injection via API call
export async function searchUsers(searchTerm: string) {
  // VULNERABLE: SQL injection via unsanitized input
  const query = `SELECT * FROM users WHERE name = '${searchTerm}'`;
  return fetch('/api/query', {
    method: 'POST',
    body: JSON.stringify({ query }),
  });
}

// Vulnerability 2: NoSQL Injection
export async function findUser(username: string, password: string) {
  // VULNERABLE: NoSQL injection
  const query = {
    username: username,
    password: password,
  };
  return fetch('/api/users/find', {
    method: 'POST',
    body: JSON.stringify(query),
  });
}

// Vulnerability 3: Command Injection
export async function executeCommand(filename: string) {
  // VULNERABLE: Command injection via filename
  const command = `cat ${filename}`;
  return fetch('/api/execute', {
    method: 'POST',
    body: JSON.stringify({ command }),
  });
}

// Vulnerability 4: LDAP Injection
export async function searchLDAP(username: string) {
  // VULNERABLE: LDAP injection
  const filter = `(uid=${username})`;
  return fetch('/api/ldap/search', {
    method: 'POST',
    body: JSON.stringify({ filter }),
  });
}

// Vulnerability 5: XML Injection
export function createXMLRequest(userId: string, action: string) {
  // VULNERABLE: XML injection
  const xml = `
    <request>
      <userId>${userId}</userId>
      <action>${action}</action>
    </request>
  `;
  return fetch('/api/xml', {
    method: 'POST',
    headers: { 'Content-Type': 'application/xml' },
    body: xml,
  });
}

// Vulnerability 6: Path Traversal
export async function readFile(filename: string) {
  // VULNERABLE: Path traversal via unsanitized filename
  const url = `/api/files/${filename}`;
  return fetch(url);
}

// Vulnerability 7: Server-Side Template Injection (client-side preparation)
export function createTemplate(userName: string, userInput: string) {
  // VULNERABLE: Template injection
  const template = `Hello ${userName}, your message: ${userInput}`;
  return fetch('/api/render', {
    method: 'POST',
    body: JSON.stringify({ template }),
  });
}

// Vulnerability 8: Code Injection via dynamic import
export async function loadModule(moduleName: string) {
  // VULNERABLE: Dynamic import with user input
  const module = await import(/* @vite-ignore */ moduleName);
  return module;
}

// Vulnerability 9: HTML Injection
export function createComment(comment: string) {
  // VULNERABLE: HTML injection
  return `<div class="comment">${comment}</div>`;
}

// Vulnerability 10: JavaScript Injection via setTimeout/setInterval
export function scheduleTask(code: string, delay: number) {
  // VULNERABLE: Code injection via setTimeout
  setTimeout(code, delay);
}

export function repeatTask(code: string, interval: number) {
  // VULNERABLE: Code injection via setInterval
  setInterval(code, interval);
}

// Vulnerability 11: RegExp Denial of Service (ReDoS)
export function validateEmail(email: string) {
  // VULNERABLE: ReDoS with evil regex
  const regex = /^([a-zA-Z0-9])(([a-zA-Z0-9])*([\._\-])?([a-zA-Z0-9]))*@([a-zA-Z0-9]+)(([a-zA-Z0-9])*[\.]([a-zA-Z0-9])+)+$/;
  return regex.test(email);
}

// Vulnerability 12: Prototype Pollution
export function mergeObjects(target: any, source: any) {
  // VULNERABLE: Prototype pollution
  for (const key in source) {
    if (typeof source[key] === 'object' && source[key] !== null) {
      target[key] = target[key] || {};
      mergeObjects(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

// Vulnerability 13: Unsafe deserialization
export function deserializeUserData(serializedData: string) {
  // VULNERABLE: Unsafe deserialization
  return JSON.parse(serializedData);
}

// Vulnerability 14: GraphQL Injection
export async function queryGraphQL(userId: string) {
  // VULNERABLE: GraphQL injection
  const query = `
    query {
      user(id: "${userId}") {
        name
        email
      }
    }
  `;
  return fetch('/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
}
