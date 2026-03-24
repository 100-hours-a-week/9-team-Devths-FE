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

  let success = false;
  try {
    const result = await deleteFcmToken(deviceId);
    success = result.ok || result.status === 404;
  } catch {
    success = false;
  } finally {
    // 로그아웃 후 다른 계정(신규 포함)이 같은 디바이스에서 로그인할 때
    // 동일 deviceId로 POST 충돌(500)이 발생하지 않도록 항상 제거
    localStorage.removeItem(DEVICE_ID_KEY);
  }
  return success;
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
      if (!token) return;

      const deviceId = getOrCreateDeviceId();

      // 재로그인 시 기존 레코드가 남아 있을 수 있으므로 PATCH로 재활성화 먼저 시도
      const patchResult = await patchFcmToken(deviceId, { isActive: true });
      if (patchResult.ok) {
        localStorage.setItem(PUSH_ACTIVE_KEY, 'true');
        return;
      }

      // 레코드 없음(404) → 신규 등록
      if (patchResult.status !== 404) return;

      const postResult = await postFcmToken(deviceId, { token, deviceType: 'WEB' });
      if (!postResult.ok) return;
      localStorage.setItem(PUSH_ACTIVE_KEY, 'true');
    };

    void register().catch(() => {
      /* 자동 등록 실패는 사용자에게 노출하지 않음 */
    });
  }, []);
}

export function usePushNotificationToggle() {
  const [isActive, setIsActive] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    if (!('Notification' in window) || Notification.permission !== 'granted') return false;
    const stored = localStorage.getItem(PUSH_ACTIVE_KEY);
    return stored === null ? false : stored === 'true';
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
        if (!deviceId) {
          toast('알림 설정을 변경하지 못했어요. 잠시 후 다시 시도해 주세요.');
          return;
        }
        const patchResult = await patchFcmToken(deviceId, { isActive: false });
        if (!patchResult.ok && patchResult.status !== 404) {
          toast('알림 설정을 변경하지 못했어요. 잠시 후 다시 시도해 주세요.');
          return;
        }
        setIsActive(false);
        localStorage.setItem(PUSH_ACTIVE_KEY, 'false');
      } else {
        const deviceId = getStoredDeviceId();

        // deviceId 없음 = 최초 등록 시도 (iOS PWA 등 앱 로드 시 권한 요청 실패 케이스)
        if (!deviceId) {
          const permission = await Notification.requestPermission();
          if (permission !== 'granted') {
            toast('알림 권한을 허용해 주세요.');
            return;
          }
          const token = await requestFcmToken();
          if (!token) {
            toast('알림을 켜지 못했어요. 잠시 후 다시 시도해 주세요.');
            return;
          }
          const newDeviceId = getOrCreateDeviceId();
          const postResult = await postFcmToken(newDeviceId, { token, deviceType: 'WEB' });
          if (!postResult.ok) {
            toast('알림을 켜지 못했어요. 잠시 후 다시 시도해 주세요.');
            return;
          }
          setIsActive(true);
          localStorage.setItem(PUSH_ACTIVE_KEY, 'true');
          return;
        }

        const patchResult = await patchFcmToken(deviceId, { isActive: true });
        if (patchResult.ok) {
          setIsActive(true);
          localStorage.setItem(PUSH_ACTIVE_KEY, 'true');
          return;
        }
        // 토큰 레코드가 삭제된 경우(404) 재등록 시도
        if (patchResult.status === 404) {
          const token = await requestFcmToken();
          if (!token) {
            toast('알림을 켜지 못했어요. 잠시 후 다시 시도해 주세요.');
            return;
          }
          const postResult = await postFcmToken(deviceId, { token, deviceType: 'WEB' });
          if (!postResult.ok) {
            toast('알림을 켜지 못했어요. 잠시 후 다시 시도해 주세요.');
            return;
          }
          setIsActive(true);
          localStorage.setItem(PUSH_ACTIVE_KEY, 'true');
          return;
        }
        toast('알림을 켜지 못했어요. 잠시 후 다시 시도해 주세요.');
      }
    } finally {
      setIsPending(false);
    }
  };

  return { isActive, isPending, toggle, isSupported };
}
