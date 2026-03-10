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

  self.registration.showNotification(title, {
    body,
    icon: '/icons/icon-192x192.png',
  });
});
