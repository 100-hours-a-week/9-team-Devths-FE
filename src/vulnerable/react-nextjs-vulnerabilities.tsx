/**
 * React and Next.js Specific Vulnerabilities
 * These are intentional vulnerabilities for CodeQL testing
 * DO NOT USE IN PRODUCTION
 */

'use client';

import React from 'react';

// Vulnerability 1: Unsafe use of useEffect with user input
export function UnsafeEffect({ userScript }: { userScript: string }) {
  React.useEffect(() => {
    // VULNERABLE: Executing user-provided script
    const script = document.createElement('script');
    script.textContent = userScript;
    document.body.appendChild(script);
  }, [userScript]);

  return <div>Script loaded</div>;
}

// Vulnerability 2: DOM Clobbering
export function DOMClobbering({ userId }: { userId: string }) {
  // VULNERABLE: Accessing DOM elements by ID can be clobbered
  const element = (window as any)[userId];
  return <div>{element?.value}</div>;
}

// Vulnerability 3: Unsafe URL construction
export function UnsafeLink({ path }: { path: string }) {
  // VULNERABLE: javascript: protocol injection
  const href = `javascript:${path}`;
  return <a href={href}>Click me</a>;
}

// Vulnerability 4: React hydration with user data
export function HydrationVulnerability({ initialData }: { initialData: string }) {
  // VULNERABLE: Hydrating with unsanitized user data
  const data = JSON.parse(initialData);

  return (
    <div>
      <script
        dangerouslySetInnerHTML={{
          __html: `window.__INITIAL_DATA__ = ${initialData}`,
        }}
      />
      <div>{data.content}</div>
    </div>
  );
}

// Vulnerability 5: Unvalidated refs
export function UnvalidatedRef() {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const executeInput = () => {
    // VULNERABLE: Executing code from input value
    if (inputRef.current) {
      eval(inputRef.current.value);
    }
  };

  return (
    <div>
      <input ref={inputRef} type="text" />
      <button onClick={executeInput}>Execute</button>
    </div>
  );
}

// Vulnerability 6: Unsafe component props spreading
export function UnsafeSpread(props: any) {
  // VULNERABLE: Spreading user-controlled props can inject dangerous attributes
  return <div {...props} />;
}

// Vulnerability 7: Client-side template injection
export function ClientSideTemplate({ template }: { template: string }) {
  const [result, setResult] = React.useState('');

  React.useEffect(() => {
    // VULNERABLE: Template evaluation with user input
    const fn = new Function('data', `return \`${template}\``);
    setResult(fn({ user: 'test' }));
  }, [template]);

  return <div dangerouslySetInnerHTML={{ __html: result }} />;
}

// Vulnerability 8: Unsafe event handler binding
export function UnsafeEventHandler({ onClick }: { onClick: string }) {
  // VULNERABLE: String-based event handler
  return <button onClick={() => eval(onClick)}>Click</button>;
}

// Vulnerability 9: Server component data exposure
export async function ServerComponentLeak() {
  // VULNERABLE: Exposing sensitive data in server component
  const sensitiveData = {
    apiKey: 'sk-secret-key',
    databaseUrl: 'postgresql://user:pass@localhost/db',
  };

  return <div>{JSON.stringify(sensitiveData)}</div>;
}

// Vulnerability 10: Unsafe Next.js API route call
export function UnsafeAPICall({ endpoint }: { endpoint: string }) {
  const callAPI = async () => {
    // VULNERABLE: Unvalidated endpoint
    const response = await fetch(`/api/${endpoint}`);
    return response.json();
  };

  return <button onClick={callAPI}>Call API</button>;
}

// Vulnerability 11: Next.js Image with unvalidated src
export function UnsafeImage({ src }: { src: string }) {
  // VULNERABLE: Unvalidated image source
  return <img src={src} alt="user content" />;
}

// Vulnerability 12: Unsafe router navigation
export function UnsafeNavigation({ path }: { path: string }) {
  const navigate = () => {
    // VULNERABLE: Unvalidated navigation
    window.location.href = path;
  };

  return <button onClick={navigate}>Navigate</button>;
}

// Vulnerability 13: React context with sensitive data
export const SensitiveContext = React.createContext({
  // VULNERABLE: Storing sensitive data in context
  apiKey: 'sk-prod-key-12345',
  userPassword: 'password123',
  sessionToken: 'secret-session-token',
});

// Vulnerability 14: Unsafe memo dependencies
export const UnsafeMemo = React.memo(({ code }: { code: string }) => {
  // VULNERABLE: Executing code in render
  eval(code);
  return <div>Rendered</div>;
});

// Vulnerability 15: Unsafe useLayoutEffect
export function UnsafeLayoutEffect({ script }: { script: string }) {
  React.useLayoutEffect(() => {
    // VULNERABLE: Synchronous script execution
    eval(script);
  }, [script]);

  return <div>Layout updated</div>;
}

// Vulnerability 16: WebSocket without validation
export function UnsafeWebSocket({ url }: { url: string }) {
  React.useEffect(() => {
    // VULNERABLE: Connecting to unvalidated WebSocket URL
    const ws = new WebSocket(url);

    ws.onmessage = (event) => {
      // VULNERABLE: Executing received messages
      eval(event.data);
    };
  }, [url]);

  return <div>WebSocket connected</div>;
}

// Vulnerability 17: Unsafe form action
export function UnsafeForm({ action }: { action: string }) {
  // VULNERABLE: Unvalidated form action
  return (
    <form action={action} method="POST">
      <input type="text" name="data" />
      <button type="submit">Submit</button>
    </form>
  );
}

// Vulnerability 18: Client-side storage of sensitive state
export function UnsafeStateStorage() {
  const [sensitiveData, setSensitiveData] = React.useState({
    password: 'user-password',
    creditCard: '1234-5678-9012-3456',
  });

  React.useEffect(() => {
    // VULNERABLE: Storing sensitive data in localStorage
    localStorage.setItem('userData', JSON.stringify(sensitiveData));
  }, [sensitiveData]);

  return <div>Data saved</div>;
}

// Vulnerability 19: Unsafe dangerouslySetInnerHTML in Next.js
export function UnsafeNextJSContent({ html }: { html: string }) {
  // VULNERABLE: User HTML in Next.js component
  return (
    <div>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

// Vulnerability 20: Unvalidated dynamic imports
export function UnsafeDynamicImport({ modulePath }: { modulePath: string }) {
  const [Component, setComponent] = React.useState<any>(null);

  React.useEffect(() => {
    // VULNERABLE: Dynamic import with user input
    import(/* @vite-ignore */ modulePath).then((module) => {
      setComponent(() => module.default);
    });
  }, [modulePath]);

  return Component ? <Component /> : <div>Loading...</div>;
}
