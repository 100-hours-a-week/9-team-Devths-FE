import { useEffect } from 'react';

import { deleteFcmToken, postFcmToken } from '@/lib/api/notifications';
import { requestFcmToken } from '@/lib/firebase/messaging';

const DEVICE_ID_KEY = 'fcm_device_id';

function getOrCreateDeviceId(): string {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

export function getStoredDeviceId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(DEVICE_ID_KEY);
}

export async function unregisterFcmToken(): Promise<void> {
  const deviceId = getStoredDeviceId();
  if (!deviceId) return;
  await deleteFcmToken(deviceId);
}

export function useFcmToken() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('Notification' in window)) return;
    if (!('serviceWorker' in navigator)) return;
    if (Notification.permission === 'denied') return;

    const register = async () => {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return;

      const token = await requestFcmToken();
      if (!token) return;

      const deviceId = getOrCreateDeviceId();
      await postFcmToken(deviceId, { token, deviceType: 'WEB' });
    };

    void register();
  }, []);
}
