import { getMessaging, getToken, onMessage } from 'firebase/messaging';

import { firebaseApp } from './app';

export function getFirebaseMessaging() {
  return getMessaging(firebaseApp);
}

export async function requestFcmToken(): Promise<string | null> {
  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
  if (!vapidKey) return null;

  try {
    const messaging = getFirebaseMessaging();
    const token = await getToken(messaging, { vapidKey });
    return token || null;
  } catch {
    return null;
  }
}

export function onForegroundMessage(callback: (payload: unknown) => void) {
  const messaging = getFirebaseMessaging();
  return onMessage(messaging, callback);
}
