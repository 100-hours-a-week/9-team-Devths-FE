/**
 * XSS (Cross-Site Scripting) Vulnerabilities
 * These are intentional vulnerabilities for CodeQL testing
 * DO NOT USE IN PRODUCTION
 */

import React from 'react';

// Vulnerability 1: dangerouslySetInnerHTML with user input
export function UnsafeInnerHTML({ userInput }: { userInput: string }) {
  // VULNERABLE: User input directly rendered as HTML
  return <div dangerouslySetInnerHTML={{ __html: userInput }} />;
}

// Vulnerability 2: DOM-based XSS via document.write
export function DOMBasedXSS() {
  React.useEffect(() => {
    // VULNERABLE: User input from URL parameter
    const params = new URLSearchParams(window.location.search);
    const message = params.get('message');
    if (message) {
      document.write(message); // XSS vulnerability
    }
  }, []);

  return <div>Check console</div>;
}

// Vulnerability 3: innerHTML manipulation
export function InnerHTMLVulnerability({ content }: { content: string }) {
  const divRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (divRef.current) {
      // VULNERABLE: Direct innerHTML assignment
      divRef.current.innerHTML = content;
    }
  }, [content]);

  return <div ref={divRef} />;
}

// Vulnerability 4: eval() with user input
export function EvalVulnerability({ code }: { code: string }) {
  const executeCode = () => {
    // VULNERABLE: eval with user-controlled input
    eval(code);
  };

  return <button onClick={executeCode}>Execute Code</button>;
}

// Vulnerability 5: Function constructor with user input
export function FunctionConstructorVuln({ expression }: { expression: string }) {
  const calculate = () => {
    // VULNERABLE: Function constructor with user input
    const fn = new Function('return ' + expression);
    return fn();
  };

  return <div onClick={calculate}>Calculate</div>;
}

// Vulnerability 6: Unescaped URL parameters in href
export function OpenRedirect() {
  const redirectUrl = new URLSearchParams(window.location.search).get('redirect');

  // VULNERABLE: Unvalidated redirect
  return <a href={redirectUrl || '#'}>Click here</a>;
}

// Vulnerability 7: Script tag injection via JSX
export function ScriptInjection({ scriptContent }: { scriptContent: string }) {
  // VULNERABLE: User-controlled script content
  return (
    <div>
      <script dangerouslySetInnerHTML={{ __html: scriptContent }} />
    </div>
  );
}

// Vulnerability 8: postMessage without origin validation
export function UnsafePostMessage() {
  React.useEffect(() => {
    window.addEventListener('message', (event) => {
      // VULNERABLE: No origin validation
      const data = event.data;
      eval(data.code); // Double vulnerability: eval + no validation
    });
  }, []);

  return <div>Listening for messages</div>;
}

// Vulnerability 9: DOM-based XSS via location.hash
export function HashBasedXSS() {
  React.useEffect(() => {
    const hash = window.location.hash.substring(1);
    // VULNERABLE: Hash value inserted into DOM
    document.getElementById('output')!.innerHTML = hash;
  }, []);

  return <div id="output" />;
}

// Vulnerability 10: Unvalidated iframe src
export function UnsafeIframe() {
  const src = new URLSearchParams(window.location.search).get('url');

  // VULNERABLE: User-controlled iframe source
  return <iframe src={src || 'about:blank'} />;
}
