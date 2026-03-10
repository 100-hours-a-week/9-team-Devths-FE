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

export async function unregisterFcmToken(): Promise<boolean> {
  const deviceId = getStoredDeviceId();
  if (!deviceId) return true;

  try {
    const result = await deleteFcmToken(deviceId);
    return result.ok || result.status === 404;
  } catch {
    return false;
  }
}

export function useFcmToken() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('Notification' in window)) return;
    if (!('serviceWorker' in navigator)) return;
    if (Notification.permission === 'denied') return;
    if (localStorage.getItem(PUSH_ACTIVE_KEY) === 'false') return;

    const register = async () => {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return;

      const token = await requestFcmToken();
      if (!token) {
        toast('푸시 알림 등록에 실패했어요. 잠시 후 다시 시도해 주세요.');
        return;
      }

      const deviceId = getOrCreateDeviceId();
      const postResult = await postFcmToken(deviceId, { token, deviceType: 'WEB' });
      if (!postResult.ok) {
        toast('푸시 알림 등록에 실패했어요. 잠시 후 다시 시도해 주세요.');
        return;
      }
      localStorage.setItem(PUSH_ACTIVE_KEY, 'true');
    };

    void register().catch(() => {
      toast('푸시 알림 등록에 실패했어요. 잠시 후 다시 시도해 주세요.');
    });
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
        const patchResult = await patchFcmToken(deviceId, { isActive: false });
        if (!patchResult.ok && patchResult.status !== 404) {
          toast('알림 설정을 변경하지 못했어요. 잠시 후 다시 시도해 주세요.');
          return;
        }
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
        if (!token) {
          toast('푸시 토큰을 가져오지 못했어요. 잠시 후 다시 시도해 주세요.');
          return;
        }
        const postResult = await postFcmToken(deviceId, { token, deviceType: 'WEB' });
        if (!postResult.ok) {
          toast('알림을 켜지 못했어요. 잠시 후 다시 시도해 주세요.');
          return;
        }
        setIsActive(true);
        localStorage.setItem(PUSH_ACTIVE_KEY, 'true');
      }
    } finally {
      setIsPending(false);
    }
  };

  return { isActive, isPending, toggle, isSupported };
}
