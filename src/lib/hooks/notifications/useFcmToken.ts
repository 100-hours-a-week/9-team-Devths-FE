import { useEffect, useState } from 'react';

import { deleteFcmToken, patchFcmToken, postFcmToken } from '@/lib/api/notifications';
import { requestFcmToken } from '@/lib/firebase/messaging';
import { toast } from '@/lib/toast/store';

const DEVICE_ID_KEY = 'fcm_device_id';
const PUSH_ACTIVE_KEY = 'fcm_notifications_active';

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
      localStorage.setItem(PUSH_ACTIVE_KEY, 'true');
    };

    void register();
  }, []);
}

export function usePushNotificationToggle() {
  const [isActive, setIsActive] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    if (!('Notification' in window) || Notification.permission !== 'granted') return false;
    const stored = localStorage.getItem(PUSH_ACTIVE_KEY);
    return stored === null ? true : stored === 'true';
  });
  const [isPending, setIsPending] = useState(false);

  const isSupported =
    typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator;

  const toggle = async () => {
    if (isPending) return;

    setIsPending(true);
    try {
      if (isActive) {
        const deviceId = getStoredDeviceId();
        if (!deviceId) return;
        await patchFcmToken(deviceId, { isActive: false });
        setIsActive(false);
        localStorage.setItem(PUSH_ACTIVE_KEY, 'false');
      } else {
        if (Notification.permission !== 'granted') {
          toast('브라우저 설정에서 알림 권한을 허용해 주세요.');
          if (Notification.permission === 'denied') return;
          const permission = await Notification.requestPermission();
          if (permission !== 'granted') return;
        }

        const deviceId = getOrCreateDeviceId();
        const token = await requestFcmToken();
        if (token) {
          await postFcmToken(deviceId, { token, deviceType: 'WEB' });
        }
        await patchFcmToken(deviceId, { isActive: true });
        setIsActive(true);
        localStorage.setItem(PUSH_ACTIVE_KEY, 'true');
      }
    } finally {
      setIsPending(false);
    }
  };

  return { isActive, isPending, toggle, isSupported };
}
