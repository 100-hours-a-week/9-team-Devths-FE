importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyDJOz6LYqovZIcVGEZzyksBl9diMRggcyE',
  authDomain: 'devths-f2222.firebaseapp.com',
  projectId: 'devths-f2222',
  storageBucket: 'devths-f2222.firebasestorage.app',
  messagingSenderId: '404725794722',
  appId: '1:404725794722:web:c2e1dd86a7807bc45754fb',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title ?? '새 알림';
  const body = payload.notification?.body ?? '';
  const targetPath = payload.data?.targetPath ?? '/';

  self.registration.showNotification(title, {
    body,
    icon: '/icons/icon-192x192.png',
    data: { targetPath },
  });
});

function resolveTargetPath(targetPath) {
  if (targetPath.startsWith('/ai/chat/')) {
    const roomId = targetPath.replace('/ai/chat/', '').split('?')[0];
    return `/llm/${roomId}?rid=${roomId}&from=notifications`;
  }
  return targetPath;
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const rawPath = event.notification.data?.targetPath ?? '/';
  const url = new URL(resolveTargetPath(rawPath), self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      const existing = windowClients.find((c) => {
        try {
          return new URL(c.url).pathname === new URL(url).pathname && 'focus' in c;
        } catch {
          return false;
        }
      });
      if (existing) return existing.focus();
      return clients.openWindow(url);
    })
  );
});
